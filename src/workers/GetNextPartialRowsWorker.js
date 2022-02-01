/*
type GetNextPartialRowsData = {
    partialResults: RowWithAccum[],
    values: CellValue[]
}

type GetNextPartialRowsResult = RowWithAccum[]
*/

const GAME_CELL_TO_VALUE = {
    one: 1,
    two: 2,
    three: 3,
    voltorb: 0,
    unset: 0,
};
const VOLTORB_VALUE = "voltorb";

function addToAccum(accum, value) {
    return {
        totalValue: accum.totalValue + GAME_CELL_TO_VALUE[value],
        numVoltorbs: accum.numVoltorbs + (value === VOLTORB_VALUE ? 1 : 0),
    };
}

function getNextPartialRows(partialResults, values) {
    const nextPartialRowsByValue = values.map((value) => {
        return partialResults.map(({ row, accum }) => {
            return {
                row: [...row, value],
                accum: addToAccum(accum, value),
            };
        });
    });

    return [].concat(...nextPartialRowsByValue);
}

self.onmessage = ({ data }) => {
    const { partialResults, values } = data;
    const result = getNextPartialRows(partialResults, values);
    self.postMessage(result);
};
