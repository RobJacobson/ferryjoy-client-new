import { MainMap } from "@/features/map";

const MAP_ONE_STYLE_URL = "mapbox://styles/xyzzy/cmd0zzajt00gn01r4fyr5fqfb";

const MapPage = () => {
  return <MainMap styleURL={MAP_ONE_STYLE_URL} />;
};

export default MapPage;
