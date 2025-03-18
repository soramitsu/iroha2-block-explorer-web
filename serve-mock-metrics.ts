import { Application, Router, ServerSentEvent } from "jsr:@oak/oak@17.1.4";
import { KeyPair } from "jsr:@iroha/core@0.3.1/crypto";
import Emittery from "npm:emittery@1.1.0";
import * as R from "npm:remeda@2.21.2";
import * as datefns from "npm:date-fns@4.1.0";
import { delay } from "jsr:@std/async@1.0.11";
import { assert } from "jsr:@std/assert@1.0.11";
import * as colors from "jsr:@std/fmt@1.0.6/colors";

type NetworkMetrics = {
  peers: number;
  domains: number;
  accounts: number;
  assets: number;
  transactions: {
    accepted: number;
    rejected: number;
  };
  latest_block: number;
  latest_block_created_at: string;
  finalized_block: number;
  average_block_time_ms: number;
  average_commit_time_ms: number;
};

const ROLES = new Set(
  [
    "Leader",
    "ProxyTail",
    "ValidatingPeer",
    "ObservingPeer",
  ] as const,
);

type Role = typeof ROLES extends Set<infer T> ? T : never;

type PeerMetrics = {
  time: string;
  /** public key */
  peer: string;
  role: Role;
  block: number;
  block_created_at: null | string;
  block_arrived_at: null | string;
  block_committed_at: null | string;
  queue_size: number;
  uptime_seconds: number;
};

type PeerInfo = {
  public_key: string;
  public_url: null | string;
  /** Backend will try to geo-resolve the `public_url` */
  location: null | {
    longitude: number;
    latitude: number;
    country: string;
    city: string;
  };
  queue_capacity: null | number;
  /** List of public keys */
  connected_peers: null | string[];
};

type MetricsService = {
  network: () => NetworkMetrics;
  peers: () => PeerMetrics[];
  peersStream: (
    abort: AbortSignal,
  ) => AsyncGenerator<PeerMetrics>;
  peersInfo: () => PeerInfo[];
};

function randomDomainsAccountsAssets(): Pick<
  NetworkMetrics,
  "domains" | "accounts" | "assets"
> {
  return {
    domains: R.randomInteger(100, 125),
    accounts: R.randomInteger(100_000, 125_000),
    assets: R.randomInteger(30_000, 50_000),
  };
}

function randomRole(): Role {
  const [role] = R.sample([...ROLES], 1);
  assert(role);
  return role;
}

class CircularQueue<T> {
  #arr: T[];
  #pointer = 0;
  #filled = 0;
  constructor(size: number) {
    this.#arr = new Array(size);
  }
  push(value: T) {
    this.#arr[this.#pointer] = value;
    this.#pointer = (this.#pointer + 1) % this.#arr.length;
    this.#filled = Math.min(this.#filled + 1, this.#arr.length);
  }
  last(): undefined | T {
    if (!this.#filled) return undefined;
    return this.#arr.at(this.#pointer - 1);
  }
  *iter() {
    for (let i = 0; i < this.#filled; i++) {
      let point = this.#pointer - i - 1;
      if (point < 0) point += this.#arr.length;
      yield this.#arr[point];
    }
  }
}

/**
 * - Create N peers with varying start time (a few months ago)
 * - Set varying queue capacities
 * - Start with some M blocks
 * - Create blocks each T time; propagate it across peers gradually,
 *   with max delay unique for each round
 * - "Take" metrics with certain periods, unique for each peer;
 *   emit events once taken.
 * - Rotate roles each round randomly
 * - Peers are all connected to each other at all times
 * - Some peers must be "non-reachable", meaning Explorer can't
 *   have their data, but they are visible in the network through other peers
 * - Domains, accounts, assets - these are random big numbers changing each round for a bit
 * - Randomly assign location to some peers
 */
function createMockMetrics(): MetricsService {
  const N_PEERS = 25;
  const N_UNREACHABLE_PEERS = 9;
  const START_DATE = new Date("2025-01-05T05:10:31.000Z");
  const START_BLOCKS = 10_422;
  const BLOCKS_CREATE_EACH = 5_400;
  const METRICS_INTERVAL = 5_000;

  const events = new Emittery<{ metrics: PeerMetrics }>();

  type PeerState = {
    key: KeyPair;
    url: URL;
    start: Date;
    queueSize: number;
    queueCapacity: number;
    location: PeerInfo["location"];
    reachable: boolean;
    blocks: number;
    block_created_at: null | Date;
    block_arrived_at: null | Date;
    block_committed_at: null | Date;
    role: Role;
  };

  const peers = R.shuffle(
    Array.from({ length: N_PEERS }, (_v, i): PeerState => {
      const key = KeyPair.random();
      const url = new URL(`http://fujiwara.sora.org/peer-${i}/`);
      const start = datefns.addMinutes(START_DATE, R.randomInteger(0, 3_000));
      const queueCapacity = R.randomInteger(30_000, 100_000);
      const reachable = i < N_UNREACHABLE_PEERS;
      return {
        key,
        url,
        start,
        queueSize: R.randomInteger(0, queueCapacity),
        queueCapacity,
        reachable,
        location: null,
        blocks: START_BLOCKS,
        role: randomRole(),
        block_arrived_at: null,
        block_committed_at: null,
        block_created_at: null,
      };
    }),
  );

  const network: NetworkMetrics = {
    peers: N_PEERS,
    transactions: {
      accepted: 51_412,
      rejected: 9232,
    },
    latest_block: START_BLOCKS,
    latest_block_created_at: new Date().toISOString(),
    finalized_block: START_BLOCKS,
    average_block_time_ms: 0,
    average_commit_time_ms: 0,
    ...randomDomainsAccountsAssets(),
  };

  async function produceBlocksLoop() {
    while (true) {
      const [producer, ...rest] = R.shuffle(peers);
      producer.blocks++;
      producer.role = randomRole();
      producer.block_arrived_at = producer.block_created_at = new Date();
      producer.block_committed_at = null;

      await Promise.all(
        rest.map(async (x) => {
          await delay(R.randomInteger(100, 1000));
          x.blocks++;
          x.role = randomRole();
          x.block_arrived_at = x.block_committed_at = new Date();
          x.block_created_at = producer.block_created_at;
        }),
      );

      producer.block_committed_at = new Date();

      Object.assign(network, randomDomainsAccountsAssets());
      network.transactions.accepted += R.randomInteger(10, 1000);
      network.transactions.rejected += R.randomInteger(5, 200);

      await delay(BLOCKS_CREATE_EACH);
    }
  }

  async function collectMetricsLoop(peer: PeerState) {
    await delay(R.randomInteger(0, METRICS_INTERVAL));

    while (true) {
      const data: PeerMetrics = {
        time: new Date().toISOString(),
        peer: peer.key.publicKey().multihash(),
        role: peer.role,
        block: peer.blocks,
        block_arrived_at: peer.block_arrived_at?.toISOString() ?? null,
        block_committed_at: peer.block_committed_at?.toISOString() ?? null,
        block_created_at: peer.block_created_at?.toISOString() ?? null,
        queue_size: peer.queueSize,
        uptime_seconds: datefns.differenceInSeconds(new Date(), peer.start),
      };
      events.emit("metrics", data);
      await delay(METRICS_INTERVAL);
    }
  }

  async function randomizeQueueSizeLoop(peer: PeerState) {
    while (true) {
      peer.queueSize = R.randomInteger(0, peer.queueCapacity * 0.8);
      await delay(300);
    }
  }

  function updateNetworkMetrics() {
    let blockLatest = 0;
    let blockLatestAt = "";
    let blockMin = Infinity;
    const avgBlockTimes: number[] = [];
    const avgCommitTimes: number[] = [];
    for (const queue of metrics.values()) {
      const last = queue.last();
      if (last) {
        if (last.block > blockLatest && last.block_created_at) {
          blockLatest = last.block;
          assert(last.block_created_at);
          blockLatestAt = last.block_created_at;
        }
        if (last.block < blockMin) blockMin = last.block;
      }

      const { diffsCommitted, diffsCreated } = R.reduce(
        [...queue.iter()],
        (acc, value) => {
          if (!acc.laterCreated && value.block_created_at) {
            acc.laterCreated = {
              block: value.block,
              time: value.block_created_at,
            };
          } else if (
            value.block_created_at && acc.laterCreated &&
            value.block !== acc.laterCreated.block
          ) {
            const blocksDiff = acc.laterCreated.block - value.block;
            const diff = datefns.differenceInMilliseconds(
              acc.laterCreated.time,
              value.block_created_at,
            );
            acc.diffsCreated.push(diff / blocksDiff);
          }

          if (!acc.laterCommitted && value.block_committed_at) {
            acc.laterCommitted = {
              block: value.block,
              time: value.block_committed_at,
            };
          } else if (
            value.block_committed_at && acc.laterCommitted &&
            acc.laterCommitted.block !== value.block
          ) {
            const blocksDiff = acc.laterCommitted.block - value.block;
            const diff = datefns.differenceInMilliseconds(
              acc.laterCommitted.time,
              value.block_committed_at,
            );
            acc.diffsCommitted.push(diff / blocksDiff);
          }

          return acc;
        },
        {
          laterCommitted: null,
          laterCreated: null,
          diffsCommitted: [],
          diffsCreated: [],
        } as {
          laterCreated: null | { block: number; time: string };
          laterCommitted: null | { block: number; time: string };
          diffsCreated: number[];
          diffsCommitted: number[];
        },
      );

      if (diffsCreated.length) {
        avgBlockTimes.push(R.mean(diffsCreated)!);
      }
      if (diffsCommitted.length) {
        avgCommitTimes.push(R.mean(diffsCommitted)!);
      }
    }

    network.latest_block = blockLatest;
    network.latest_block_created_at = blockLatestAt;
    network.finalized_block = blockMin;
    network.average_block_time_ms = R.mean(avgBlockTimes) ?? 0;
    network.average_commit_time_ms = R.mean(avgCommitTimes) ?? 0;
  }

  const metrics = new Map<string, CircularQueue<PeerMetrics>>();
  events.on("metrics", (data) => {
    const queue = metrics.get(data.peer) ?? new CircularQueue(30);
    queue.push(data);
    metrics.set(data.peer, queue);
  });

  produceBlocksLoop();
  for (const x of peers) {
    collectMetricsLoop(x);
    randomizeQueueSizeLoop(x);
  }

  return {
    network: () => {
      // console.time("upd-net");
      updateNetworkMetrics();
      // console.timeEnd("upd-net");
      return network;
    },
    peers: () => {
      return R.pipe(
        [...metrics.values()],
        R.map((x) => x.last()),
        R.filter((x) => !!x),
      );
    },
    peersStream: async function* (signal) {
      // first - emit all existing ones
      for (const queue of metrics.values()) {
        const data = queue.last();
        if (data) yield data;
      }

      const abortPromise = new Promise<null>((resolve) => {
        signal.addEventListener("abort", () => resolve(null));
      });

      while (true) {
        const data = await Promise.race(
          [abortPromise, events.once("metrics")],
        );
        if (!data) break;
        yield data;
      }
    },
    peersInfo: () => {
      return peers.map<PeerInfo>((x) => {
        if (x.reachable) {
          return {
            public_key: x.key.publicKey().multihash(),
            public_url: x.url.href,
            location: x.location,
            queue_capacity: x.queueCapacity,
            connected_peers: R.pipe(
              peers,
              R.filter((y) => y !== x),
              R.map((y) => y.key.publicKey().multihash()),
            ),
          };
        } else {
          return {
            public_key: x.key.publicKey().multihash(),
            public_url: null,
            location: null,
            queue_capacity: null,
            connected_peers: null,
          };
        }
      });
    },
  };
}

const metrics = createMockMetrics();

const router = new Router()
  .get("/api/v1/metrics", (ctx) => {
    ctx.response.body = metrics.network();
  })
  .get("/api/v1/metrics/peers", async (ctx) => {
    if (typeof ctx.request.url.searchParams.get("sse") === "string") {
      const target = await ctx.sendEvents();
      const abort = new AbortController();
      const stream = metrics.peersStream(abort.signal);

      target.addEventListener("close", () => {
        abort.abort();
      });

      for await (const data of stream) {
        target.dispatchEvent(new ServerSentEvent("metrics", { data }));
      }
    } else {
      ctx.response.body = metrics.peers();
    }
  })
  .get("/api/v1/metrics/peers/info", (ctx) => {
    ctx.response.body = metrics.peersInfo();
  });

const app = new Application().use(router.routes()).use(router.allowedMethods());

const PORT = 8099;
app.listen({ port: PORT });
console.log(
  `Server is listening on ${
    colors.bold(
      colors.blue(`http://localhost:${PORT}/api/v1/metrics`),
    )
  }`,
);
