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
  blocks: number;
  domains: number;
  accounts: number;
  assets: number;
  transactions: {
    accepted: number;
    rejected: number;
  };
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

  const peers = R.shuffle(R.times(N_PEERS, (i): PeerState => {
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
  }));

  const network: NetworkMetrics = {
    blocks: START_BLOCKS,
    ...randomDomainsAccountsAssets(),
    peers: N_PEERS,
    transactions: {
      accepted: 51_412,
      rejected: 9232,
    },
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

      network.blocks = producer.blocks;
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

  const latestMetrics = new Map<string, PeerMetrics>();
  events.on("metrics", (data) => {
    latestMetrics.set(data.peer, data);
  });

  produceBlocksLoop();
  for (const x of peers) {
    collectMetricsLoop(x);
    randomizeQueueSizeLoop(x);
  }

  return {
    network: () => {
      return network;
    },
    peers: () => {
      return [...latestMetrics.values()];
    },
    peersStream: async function* (signal) {
      // first - emit all existing ones
      for (const data of latestMetrics.values()) {
        yield data;
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
