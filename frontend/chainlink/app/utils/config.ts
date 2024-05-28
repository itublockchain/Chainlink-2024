import { http, createConfig } from "wagmi";
import { sepolia, optimismSepolia, avalancheFuji, polygonAmoy, arbitrumSepolia} from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia, optimismSepolia, avalancheFuji, polygonAmoy, arbitrumSepolia],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [optimismSepolia.id]: http("https://optimism-sepolia.drpc.org"),
    [avalancheFuji.id]: http("https://rpc.ankr.com/avalanche_fuji"),
    [polygonAmoy.id]: http("https://polygon-amoy.drpc.org"),
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
  },
});