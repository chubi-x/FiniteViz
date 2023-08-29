import { useEffect, useState } from "react";
export default function Elements({ elementsProp, numNodes, showSplits, children }) {
  const { nodesPerElement, numElements } = elementsProp;
  const defaultElements = [
    [0, 1, 2, 3, 1],
    [1, 4, 5, 2, 1],
    [3, 2, 5, 6, 1]
  ];
  const useDefaultElements = true;
  const initialElements = Array.from({ length: numElements }, () => new Array(nodesPerElement).fill(""));
  const [elements, setElements] = useState(useDefaultElements ? defaultElements : initialElements);
  // useEffect(() => console.log(elements), [elements]);
  const checkElementsComplete = () => {
    return elements.every((el) => el.every((node) => node !== ""));
  };
  function updateElements(i, j, value) {
    setElements((prev) => {
      return prev.map((row, rowIndex) => (rowIndex === i ? [...row.slice(0, j), parseInt(value), ...row.slice(j + 1)] : row));
    });
  }
  function printElementOptions() {
    const options = [];
    for (let i = 0; i < numNodes; i++) options.push(i);
    return options;
  }
  function defaultNodeValues(numElements) {
    const defaults = [];
    for (let i = 0; i < nodesPerElement; i++) useDefaultElements ? defaults.push(elements[numElements][i]) : defaults.push("Choose Node");
    return defaults;
  }
  function defineElementNodes() {
    const elements = [];
    for (let i = 0; i < numElements; i++) {
      const element = (
        <div key={i}>
          Element {i}:
          <div>
            Nodes:
            {defaultNodeValues(i).map((defaultValue, j) => (
              <select defaultValue={defaultValue} onChange={(e) => updateElements(i, j, e.target.value)} key={j}>
                {!useDefaultElements && (
                  <option disabled value={"Choose Node"}>
                    Choose Node
                  </option>
                )}
                {printElementOptions().map((option) => (
                  <option key={option} value={option}>
                    {" "}
                    {option}{" "}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      );
      elements.push(element);
    }
    return elements;
  }
  return (
    <>
      <form id="elements" className="">
        {defineElementNodes().map((element, index) => (
          <div key={index}>{element}</div>
        ))}
        <button
          id="defineSplits"
          onClick={() => showSplits(true)}
          disabled={!checkElementsComplete()}
          type="button"
          className="bg-blue-300 p-2 rounded-md"
        >
          Define Splits
        </button>
      </form>
      {children}
    </>
  );
}

