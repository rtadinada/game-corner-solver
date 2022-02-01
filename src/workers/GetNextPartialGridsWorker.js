/*
type GetNextPartialGridsData = {
    partialResults: ValueGrid[];
    rowsToAdd: ValueGridRow[];
};

type GetNextPartialGridsResult = ValueGrid[];
*/

function getNextPartialGrids(partialResults, rowsToAdd) {
    const nextPartialGridsByRow = rowsToAdd.map((rowToAdd) => {
        return partialResults.map((partialResult) => {
            return [...partialResult, rowToAdd];
        });
    });

    return [].concat(...nextPartialGridsByRow);
}

self.onmessage = ({ data }) => {
    const { partialResults, rowsToAdd } = data;
    const result = getNextPartialGrids(partialResults, rowsToAdd);
    self.postMessage(result);
};
