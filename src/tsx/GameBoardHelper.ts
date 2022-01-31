import * as R from "ramda";

export type One = "one";
export type Two = "two";
export type Three = "three";
export type Voltorb = "voltorb";

export type CellValue = One | Two | Three | Voltorb;

export type ValueGridRow = CellValue[];
export type ValueGrid = ValueGridRow[];

export type CellLikelihoods = Record<CellValue, number>;

export type LikelihoodRow = CellLikelihoods[];
export type LikelihoodGrid = LikelihoodRow[];

export type Unset = "unset";
export type GameCell = CellValue | Unset;

export type GameGridRow = GameCell[];
export type GameGrid = GameGridRow[];

export type Accum = {
    totalValue: number;
    numVoltorbs: number;
};

export type GameBoard = {
    grid: GameGrid;
    rowAccums: Accum[];
    colAccums: Accum[];
};

export const ONE_VALUE: One = "one";
export const TWO_VALUE: Two = "two";
export const THREE_VALUE: Three = "three";
export const VOLTORB_VALUE: Voltorb = "voltorb";
export const CELL_VALUES: CellValue[] = [ONE_VALUE, TWO_VALUE, THREE_VALUE, VOLTORB_VALUE];

export const UNSET_VALUE: Unset = "unset";
export const GAME_CELL_VALUES: GameCell[] = [...CELL_VALUES, UNSET_VALUE];

export const NUM_ROWS = 5;
export const NUM_COLS = 5;

export const GAME_CELL_TO_VALUE: Record<GameCell, number> = {
    one: 1,
    two: 2,
    three: 3,
    voltorb: 0,
    unset: 0,
};

const EMPTY_ACCUM: Accum = { totalValue: 0, numVoltorbs: 0 };

export function initGameBoard(): GameBoard {
    const grid = R.repeat(R.repeat(UNSET_VALUE, NUM_COLS), NUM_ROWS);
    const rowAccums = R.repeat({ totalValue: NUM_COLS, numVoltorbs: 0 }, NUM_ROWS);
    const colAccums = R.repeat({ totalValue: NUM_ROWS, numVoltorbs: 0 }, NUM_COLS);

    return {
        grid,
        rowAccums,
        colAccums,
    };
}

export function isValidRowAccum(accum: Accum) {
    return accum.totalValue <= NUM_COLS * 3 && accum.numVoltorbs <= NUM_COLS;
}

export function isValidColAccum(accum: Accum) {
    return accum.totalValue <= NUM_ROWS * 3 && accum.numVoltorbs <= NUM_ROWS;
}

export function setAccumValue(accums: Accum[], index: number, value: Accum): Accum[] {
    return R.update(index, value, accums);
}

export function getGameCell(grid: GameGrid, rowNum: number, colNum: number): GameCell {
    const row = grid[rowNum];
    return row[colNum];
}

export function getNextGameCellValue(val: GameCell): GameCell {
    if (val === UNSET_VALUE) {
        return ONE_VALUE;
    } else if (val === ONE_VALUE) {
        return TWO_VALUE;
    } else if (val === TWO_VALUE) {
        return THREE_VALUE;
    } else if (val === THREE_VALUE) {
        return VOLTORB_VALUE;
    } else {
        // val === VOLTORB_VALUE
        return UNSET_VALUE;
    }
}

export function setGameGridValue(
    grid: GameGrid,
    rowNum: number,
    colNum: number,
    value: GameCell
): GameGrid {
    const row = grid[rowNum];
    const updatedRow = R.update(colNum, value, row);
    return R.update(rowNum, updatedRow, grid);
}

function addToAccum(accum: Accum, cell: GameCell): Accum {
    return {
        totalValue: accum.totalValue + GAME_CELL_TO_VALUE[cell],
        numVoltorbs: accum.numVoltorbs + (cell === VOLTORB_VALUE ? 1 : 0),
    };
}

function getPartialAccum(values: GameCell[]): Accum {
    return R.reduce(addToAccum, EMPTY_ACCUM, values);
}

export function getPartialRowAccum(grid: GameGrid, rowNum: number): Accum {
    return getPartialAccum(grid[rowNum]);
}

export function getPartialColAccum(grid: GameGrid, colNum: number): Accum {
    return getPartialAccum(R.map((row: GameGridRow): GameCell => row[colNum], grid));
}

export function isPartialAccumValid(partialAccum: Accum, accum: Accum): boolean {
    return (
        partialAccum.totalValue <= accum.totalValue && partialAccum.numVoltorbs <= accum.numVoltorbs
    );
}

type UpdateParams = {
    updatedGrid?: GameGrid;
    updatedRowAccums?: Accum[];
    updatedColAccums?: Accum[];
};
export function updateGameBoard(board: GameBoard, updatedParams: UpdateParams): GameBoard {
    const { updatedGrid, updatedRowAccums, updatedColAccums } = updatedParams;
    let newBoard = board;
    newBoard = updatedGrid !== undefined ? { ...newBoard, grid: updatedGrid } : newBoard;
    newBoard =
        updatedRowAccums !== undefined ? { ...newBoard, rowAccums: updatedRowAccums } : newBoard;
    newBoard =
        updatedColAccums !== undefined ? { ...newBoard, colAccums: updatedColAccums } : newBoard;
    return newBoard;
}

type RowWithAccum = {
    row: ValueGridRow;
    accum: Accum;
};
type CellValueCounts = Record<CellValue, number>;
type ValueCountsRow = CellValueCounts[];
type ValueCountsGrid = ValueCountsRow[];

const EMPTY_VALUES_COUNT: CellValueCounts = {
    one: 0,
    two: 0,
    three: 0,
    voltorb: 0,
};
const EMPTY_VALUE_COUNTS_GRID: ValueCountsGrid = R.repeat(
    R.repeat(EMPTY_VALUES_COUNT, NUM_COLS),
    NUM_ROWS
);

function isAccumEqual(accum: Accum, other: Accum): boolean {
    return accum.totalValue === other.totalValue && accum.numVoltorbs === other.numVoltorbs;
}

function getOverallMaxAccum(accums: Accum[]): Accum {
    return R.reduce(
        (prevMaxAccum: Accum, next: Accum): Accum => {
            return {
                totalValue: Math.max(prevMaxAccum.totalValue, next.totalValue),
                numVoltorbs: Math.max(prevMaxAccum.numVoltorbs, next.numVoltorbs),
            };
        },
        EMPTY_ACCUM,
        accums
    );
}

function isRowValid(board: GameBoard, rowNum: number, inputRow: RowWithAccum): boolean {
    const inputAccum = inputRow.accum;
    const boardAccum = board.rowAccums[rowNum];
    if (!isAccumEqual(inputAccum, boardAccum)) {
        return false;
    }

    const boardRow = board.grid[rowNum];
    for (let colNum = 0; colNum < NUM_COLS; colNum++) {
        const boardValue = boardRow[colNum];
        const inputValue = inputRow.row[colNum];
        if (boardValue !== UNSET_VALUE && boardValue !== inputValue) {
            return false;
        }
    }

    return true;
}

function getPossibleValueRowsWithAccums(board: GameBoard): RowWithAccum[] {
    const maxRowAccum = getOverallMaxAccum(board.rowAccums);

    let colNum = 0;
    let partialResults: RowWithAccum[] = [{ row: [], accum: EMPTY_ACCUM }];
    while (colNum < NUM_COLS) {
        const nextPartialRowsByValue: RowWithAccum[][] = R.map(
            (value: CellValue): RowWithAccum[] => {
                return R.map(({ row, accum }): RowWithAccum => {
                    return {
                        row: R.append(value, row),
                        accum: addToAccum(accum, value),
                    };
                }, partialResults);
            },
            CELL_VALUES
        );
        const nextPartialRows: RowWithAccum[] = ([] as RowWithAccum[]).concat(
            ...nextPartialRowsByValue
        );

        partialResults = R.filter((row: RowWithAccum): boolean => {
            return isPartialAccumValid(row.accum, maxRowAccum);
        }, nextPartialRows);

        colNum += 1;
    }

    return partialResults;
}

function getPossibleValueGrids(board: GameBoard): ValueGrid[] {
    const possibleRows = getPossibleValueRowsWithAccums(board);

    let rowNum = 0;
    let partialResults: ValueGrid[] = [[]];
    while (rowNum < NUM_ROWS) {
        const validRowsWithAccums = R.filter(
            (row: RowWithAccum) => isRowValid(board, rowNum, row),
            possibleRows
        );
        const validRows = R.map((row: RowWithAccum) => row.row, validRowsWithAccums);

        const nextPartialGridsByValidRow: ValueGrid[][] = R.map((rowToAdd: ValueGridRow) => {
            return R.map(R.append(rowToAdd), partialResults);
        }, validRows);

        const nextPartialGrids: ValueGrid[] = ([] as ValueGrid[]).concat(
            ...nextPartialGridsByValidRow
        );

        partialResults = R.filter((grid: ValueGrid): boolean => {
            for (let colNum = 0; colNum < NUM_COLS; colNum += 1) {
                const partialAccum = getPartialColAccum(grid, colNum);
                const boardAccum = board.colAccums[colNum];
                if (!isPartialAccumValid(partialAccum, boardAccum)) {
                    return false;
                }
            }
            return true;
        }, nextPartialGrids);

        rowNum += 1;
    }

    return R.filter((grid: ValueGrid): boolean => {
        for (let colNum = 0; colNum < NUM_COLS; colNum += 1) {
            const partialAccum = getPartialColAccum(grid, colNum);
            const boardAccum = board.colAccums[colNum];
            if (!isAccumEqual(partialAccum, boardAccum)) {
                return false;
            }
        }
        return true;
    }, partialResults);
}

export function getLikelihoods(board: GameBoard): LikelihoodGrid | null {
    const possibleGrids = getPossibleValueGrids(board);
    if (possibleGrids.length === 0) {
        return null;
    }

    const valueCounts: ValueCountsGrid = R.reduce(
        (accum: ValueCountsGrid, grid: ValueGrid): ValueCountsGrid => {
            return R.map((rowNum) => {
                return R.map((colNum) => {
                    const accumCount = accum[rowNum][colNum];
                    const value = grid[rowNum][colNum];
                    return {
                        one: accumCount.one + (value === ONE_VALUE ? 1 : 0),
                        two: accumCount.two + (value === TWO_VALUE ? 1 : 0),
                        three: accumCount.three + (value === THREE_VALUE ? 1 : 0),
                        voltorb: accumCount.voltorb + (value === VOLTORB_VALUE ? 1 : 0),
                    };
                }, R.range(0, NUM_COLS));
            }, R.range(0, NUM_ROWS));
        },
        EMPTY_VALUE_COUNTS_GRID,
        possibleGrids
    );
    const numPermutations = possibleGrids.length;
    return R.map((row: ValueCountsRow): LikelihoodRow => {
        return R.map((counts: CellValueCounts): CellLikelihoods => {
            return {
                one: counts.one / numPermutations,
                two: counts.two / numPermutations,
                three: counts.three / numPermutations,
                voltorb: counts.voltorb / numPermutations,
            };
        }, row);
    }, valueCounts);
}
