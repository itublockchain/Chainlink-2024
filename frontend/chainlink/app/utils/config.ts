import { http, createConfig } from "wagmi";
import { sepolia, optimismSepolia, avalancheFuji, polygonAmoy, arbitrumSepolia} from "wagmi/chains";

export const config = createConfig({
  chains: [sepolia, optimismSepolia, avalancheFuji, polygonAmoy, arbitrumSepolia],
  transports: {
    [sepolia.id]: http("https://rpc.ankr.com/eth_sepolia/d17775fb78762b92aacf9f30af7ccaac0c4e758d5bb9f2ebc3faef3b9cbed604"),
    [optimismSepolia.id]: http("https://rpc.ankr.com/optimism_sepolia/d17775fb78762b92aacf9f30af7ccaac0c4e758d5bb9f2ebc3faef3b9cbed604"),
    [avalancheFuji.id]: http("https://rpc.ankr.com/avalanche_fuji/d17775fb78762b92aacf9f30af7ccaac0c4e758d5bb9f2ebc3faef3b9cbed604"),
    [polygonAmoy.id]: http("https://rpc.ankr.com/polygon_amoy/d17775fb78762b92aacf9f30af7ccaac0c4e758d5bb9f2ebc3faef3b9cbed604"),
    [arbitrumSepolia.id]: http("https://rpc.ankr.com/arbitrum_sepolia/d17775fb78762b92aacf9f30af7ccaac0c4e758d5bb9f2ebc3faef3b9cbed604"),
  },
});