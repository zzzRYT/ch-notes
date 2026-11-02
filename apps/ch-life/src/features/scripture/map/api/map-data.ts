import type { MapData } from "../model/types";
import periods from "./periods.json";
import places from "./places.json";
import scenes from "./scenes.json";

/** 검토를 마친 출시 연결표(#101). 항목을 더할 때는 근거(source·basis)를 함께 남긴다. */
export const MAP_DATA: MapData = { periods, places, scenes } as MapData;
