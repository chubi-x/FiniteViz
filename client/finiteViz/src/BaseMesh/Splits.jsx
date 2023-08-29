import { useState } from "react";
export default function Splits({}) {
  const defaultSplits = [
    [0, 1, 2],
    [0, 3, 2],
    [1, 4, 2]
  ];
  const [splits, setSplits] = useState([
    [0, 1, 2],
    [0, 3, 2],
    [1, 4, 2]
  ]);
  return (
    <form id="splits" className="">
      <button id="vizBaseMesh" type="button" class="bg-blue-300 p-2 rounded-md">
        Visualise Base Mesh
      </button>
    </form>
  );
}

