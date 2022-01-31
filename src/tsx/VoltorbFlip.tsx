import style from "../css/VoltorbFlip.css";

import React, { ReactNode } from "react";
import * as R from "ramda";
import * as GameBoardHelper from "./GameBoardHelper";
import {
    GameBoard,
    CellLikelihoods,
    Accum,
    LikelihoodRow,
    CellValue,
    LikelihoodGrid,
} from "./GameBoardHelper";

type Props = {};
type State = {
    board: GameBoard;
    likelihoodGrid: LikelihoodGrid | null;
    isOutOfDate: boolean;
    isComputing: boolean;
};

const CELL_VALUE_TO_STRING: Record<CellValue, string> = {
    one: "1",
    two: "2",
    three: "3",
    voltorb: "💣",
};

const INITIAL_STATE: State = {
    ...GameBoardHelper.initGameBoardAndLikelihoods(),
    isOutOfDate: false,
    isComputing: false,
};

function formatPercent(chance: number): string {
    return `${(chance * 100).toFixed(2)}%`;
}

export default class VoltorbFlip extends React.Component<Props, State> {
    state = INITIAL_STATE;

    renderCell = (
        rowNum: number,
        colNum: number,
        likelihoods: CellLikelihoods | null,
        lowestVol: number | null
    ): React.ReactNode => {
        const cellVal = GameBoardHelper.getGameCell(this.state.board.grid, rowNum, colNum);
        const keyName = `${rowNum}-${colNum}`;

        const handleClick = (_: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
            this.setState((prevState) => {
                const currVal = GameBoardHelper.getGameCell(prevState.board.grid, rowNum, colNum);
                const nextVal = GameBoardHelper.getNextGameCellValue(currVal);
                const updatedGrid = GameBoardHelper.setGameGridValue(
                    prevState.board.grid,
                    rowNum,
                    colNum,
                    nextVal
                );

                return {
                    board: GameBoardHelper.updateGameBoard(prevState.board, { updatedGrid }),
                    isComputing: true,
                    isOutOfDate: true,
                };
            });
        };

        let addlClass = "";
        if (this.state.isOutOfDate) {
            addlClass = style.playCellOutOfDate;
        } else if (likelihoods === null || lowestVol === null) {
            addlClass = style.invalidColor;
        } else if (likelihoods.voltorb === 0) {
            addlClass = style.playCellNoBomb;
        } else if (likelihoods.voltorb === 1) {
            addlClass = style.invalidColor;
        } else if (
            likelihoods.two + likelihoods.three > 0.5 ||
            likelihoods.voltorb < lowestVol + 0.1
        ) {
            addlClass = style.playCellLikelyPoints;
        } else if (likelihoods.two === 0 && likelihoods.three === 0) {
            addlClass = style.playCellNoPoints;
        }

        if (cellVal === GameBoardHelper.UNSET_VALUE) {
            const likelihoodsValid = !this.state.isOutOfDate && likelihoods !== null;
            return (
                <div
                    key={keyName}
                    className={`${style.playCellUnset} ${addlClass}`}
                    onClick={handleClick}
                >
                    <div className={style.likelihoodName}>
                        {CELL_VALUE_TO_STRING[GameBoardHelper.ONE_VALUE]}:
                    </div>
                    <div className={style.likelihoodValue}>
                        {formatPercent(likelihoodsValid ? likelihoods.one : 0)}
                    </div>
                    <div className={style.likelihoodName}>
                        {CELL_VALUE_TO_STRING[GameBoardHelper.TWO_VALUE]}:
                    </div>
                    <div className={style.likelihoodValue}>
                        {formatPercent(likelihoodsValid ? likelihoods.two : 0)}
                    </div>
                    <div className={style.likelihoodName}>
                        {CELL_VALUE_TO_STRING[GameBoardHelper.THREE_VALUE]}:
                    </div>
                    <div className={style.likelihoodValue}>
                        {formatPercent(likelihoodsValid ? likelihoods.three : 0)}
                    </div>
                    <div className={style.likelihoodName}>
                        {CELL_VALUE_TO_STRING[GameBoardHelper.VOLTORB_VALUE]}:
                    </div>
                    <div className={style.likelihoodValue}>
                        {formatPercent(likelihoodsValid ? likelihoods.voltorb : 0)}
                    </div>
                </div>
            );
        }

        return (
            <div key={keyName} className={style.playCellSet} onClick={handleClick}>
                {CELL_VALUE_TO_STRING[cellVal]}
            </div>
        );
    };

    renderRowAccum = (rowNum: number): React.ReactNode => {
        const handleTotalChange = (e: React.FormEvent<HTMLInputElement>) => {
            const newTotal = Number.parseInt(e.currentTarget.value);
            const accumTest = this.state.board.rowAccums[rowNum];
            const updatedAccumTest = {
                ...accumTest,
                totalValue: newTotal,
            };
            if (!GameBoardHelper.isValidRowAccum(updatedAccumTest)) {
                return;
            }

            this.setState((prevState) => {
                const accum = prevState.board.rowAccums[rowNum];
                const updatedAccum = {
                    ...accum,
                    totalValue: newTotal,
                };
                const updatedRowAccums = GameBoardHelper.setAccumValue(
                    prevState.board.rowAccums,
                    rowNum,
                    updatedAccum
                );

                return {
                    board: GameBoardHelper.updateGameBoard(prevState.board, { updatedRowAccums }),
                };
            });
        };
        const handleVoltorbChange = (e: React.FormEvent<HTMLInputElement>) => {
            const newNumVoltorbs = Number.parseInt(e.currentTarget.value);
            const accumTest = this.state.board.rowAccums[rowNum];
            const updatedAccumTest = {
                ...accumTest,
                numVoltorbs: newNumVoltorbs,
                isOutOfDate: true,
            };
            if (!GameBoardHelper.isValidRowAccum(updatedAccumTest)) {
                return;
            }

            this.setState((prevState) => {
                const accum = prevState.board.rowAccums[rowNum];
                const updatedAccum = {
                    ...accum,
                    numVoltorbs: newNumVoltorbs,
                };
                const updatedRowAccums = GameBoardHelper.setAccumValue(
                    prevState.board.rowAccums,
                    rowNum,
                    updatedAccum
                );

                return {
                    board: GameBoardHelper.updateGameBoard(prevState.board, { updatedRowAccums }),
                    isOutOfDate: true,
                };
            });
        };

        const inputAccum = this.state.board.rowAccums[rowNum];
        const rowPartialAccum = GameBoardHelper.getPartialRowAccum(this.state.board.grid, rowNum);
        const isValid = GameBoardHelper.isPartialAccumValid(rowPartialAccum, inputAccum);

        return this.renderAccum(
            `rowAccum-${rowNum}`,
            inputAccum,
            isValid,
            handleTotalChange,
            handleVoltorbChange
        );
    };

    renderColAccum = (colNum: number): React.ReactNode => {
        const handleTotalChange = (e: React.FormEvent<HTMLInputElement>) => {
            const newTotal = Number.parseInt(e.currentTarget.value);
            const accumTest = this.state.board.colAccums[colNum];
            const updatedAccumTest = {
                ...accumTest,
                totalValue: newTotal,
            };
            if (!GameBoardHelper.isValidColAccum(updatedAccumTest)) {
                return;
            }

            this.setState((prevState) => {
                const accum = prevState.board.colAccums[colNum];
                const updatedAccum = {
                    ...accum,
                    totalValue: newTotal,
                };
                const updatedColAccums = GameBoardHelper.setAccumValue(
                    prevState.board.colAccums,
                    colNum,
                    updatedAccum
                );

                return {
                    board: GameBoardHelper.updateGameBoard(prevState.board, { updatedColAccums }),
                    isOutOfDate: true,
                };
            });
        };
        const handleVoltorbChange = (e: React.FormEvent<HTMLInputElement>) => {
            const newNumVoltorbs = Number.parseInt(e.currentTarget.value);
            const accumTest = this.state.board.rowAccums[colNum];
            const updatedAccumTest = {
                ...accumTest,
                numVoltorbs: newNumVoltorbs,
            };
            if (!GameBoardHelper.isValidColAccum(updatedAccumTest)) {
                return;
            }

            this.setState((prevState) => {
                const accum = prevState.board.colAccums[colNum];
                const updatedAccum = {
                    ...accum,
                    numVoltorbs: newNumVoltorbs,
                };
                const updatedColAccums = GameBoardHelper.setAccumValue(
                    prevState.board.colAccums,
                    colNum,
                    updatedAccum
                );

                return {
                    board: GameBoardHelper.updateGameBoard(prevState.board, { updatedColAccums }),
                    isOutOfDate: true,
                };
            });
        };

        const inputAccum = this.state.board.colAccums[colNum];
        const colPartialAccum = GameBoardHelper.getPartialColAccum(this.state.board.grid, colNum);
        const isValid = GameBoardHelper.isPartialAccumValid(colPartialAccum, inputAccum);

        return this.renderAccum(
            `colAccum-${colNum}`,
            inputAccum,
            isValid,
            handleTotalChange,
            handleVoltorbChange
        );
    };

    renderAccum = (
        key: string,
        accum: Accum,
        isValid: boolean,
        handleTotalChange: React.FormEventHandler<HTMLInputElement>,
        handleVoltorbChange: React.FormEventHandler<HTMLInputElement>
    ): React.ReactNode => {
        return (
            <div key={key} className={`${style.accumCell} ${!isValid ? style.invalidColor : ""}`}>
                <div className={style.inputRow}>
                    <span className={style.inputName}>#</span>
                    <input
                        className={style.inputNum}
                        type="text"
                        value={accum.totalValue}
                        onChange={handleTotalChange}
                    />
                </div>
                <div className={style.inputRow}>
                    <span className={style.inputName}>💣</span>
                    <input
                        className={style.inputNum}
                        type="text"
                        value={accum.numVoltorbs}
                        onChange={handleVoltorbChange}
                    />
                </div>
            </div>
        );
    };

    renderRow = (
        rowNum: number,
        rowLikelihoods: LikelihoodRow | null,
        lowestVol: number | null
    ): React.ReactNode[] => {
        const playCells: ReactNode[] = R.map(
            (colNum: number) =>
                this.renderCell(
                    rowNum,
                    colNum,
                    rowLikelihoods !== null ? rowLikelihoods[colNum] : null,
                    lowestVol
                ),
            R.range(0, GameBoardHelper.NUM_COLS)
        );
        return R.append(this.renderRowAccum(rowNum), playCells);
    };

    renderColAccumRow = (): React.ReactNode[] => {
        const accums = R.map(this.renderColAccum, R.range(0, GameBoardHelper.NUM_COLS));
        const calculateButton = (
            <div className={style.buttonCell}>
                <button
                    className={style.button}
                    onClick={() => {
                        this.setState({ isComputing: true, isOutOfDate: true });
                    }}
                >
                    Calculate
                </button>
                <button
                    className={style.button}
                    onClick={() => {
                        this.setState(INITIAL_STATE);
                    }}
                >
                    Reset
                </button>
            </div>
        );
        return R.append(calculateButton, accums);
    };

    async componentDidUpdate(prevProps: Props, prevState: State): Promise<void> {
        if (this.state.isComputing && !prevState.isComputing) {
            const newLikelihoods = await GameBoardHelper.getLikelihoods(this.state.board);

            this.setState({
                likelihoodGrid: newLikelihoods,
                isComputing: false,
                isOutOfDate: false,
            });
        }
    }

    render(): React.ReactNode {
        const gridStyle = {
            gridTemplateColumns: `repeat(${GameBoardHelper.NUM_COLS + 1}, 1fr)`,
        };

        const likelihoodGrid = this.state.isComputing ? null : this.state.likelihoodGrid;
        const lowestVol =
            likelihoodGrid === null
                ? null
                : R.reduce(
                      (prevLow: number, row: LikelihoodRow): number => {
                          const rowLow = R.reduce(
                              (prevLow: number, l: CellLikelihoods): number => {
                                  return Math.min(prevLow, l.voltorb);
                              },
                              1,
                              row
                          );
                          return Math.min(prevLow, rowLow);
                      },
                      1,
                      likelihoodGrid
                  );

        return (
            <div className={style.playGrid} style={gridStyle}>
                {R.map(
                    (rowNum: number) =>
                        this.renderRow(
                            rowNum,
                            likelihoodGrid !== null ? likelihoodGrid[rowNum] : null,
                            lowestVol
                        ),
                    R.range(0, GameBoardHelper.NUM_ROWS)
                )}
                {this.renderColAccumRow()}
                {this.state.isComputing && <div className={style.computingOverlay} />}
            </div>
        );
    }
}
