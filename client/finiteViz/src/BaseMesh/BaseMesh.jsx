import { useState } from "react";
import MeshProps from "./MeshProps";
import Coordinates from "./Coordinates";
import Elements from "./Elements";
import Splits from "./Splits";
export function BaseMesh() {
  const [numDims, setNumDims] = useState(2);
  const [numElements, setNumElements] = useState(3);
  const [numNodes, setNumNodes] = useState(0);
  const [nodesPerElement, setNodesPerElement] = useState(4);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [showSplits, setShowSplits] = useState(false);
  return (
    <>
      <MeshProps
        dims={{ numDims, setNumDims }}
        elements={{ numElements, setNumElements }}
        nodes={{ nodesPerElement, setNodesPerElement, setShowCoordinates, setNumNodes }}
      >
        {showCoordinates && (
          <Coordinates showElements={setShowElements} numDims={numDims} numNodes={numNodes}>
            {showElements && (
              <Elements showSplits={setShowSplits} numNodes={numNodes} elementsProp={{ numElements, nodesPerElement }}>
                {showSplits && <Splits />}
              </Elements>
            )}
          </Coordinates>
        )}
      </MeshProps>
    </>
  );
}

