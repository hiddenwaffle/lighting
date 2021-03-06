const cells = [
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], // Top two are obscured
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' '],
    [' ', 'x', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' '],
    [' ', 'x', ' ', 'x', ' ', 'x', ' ', ' ', ' ', ' '],
    [' ', ' ', 'x', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'x', 'x', 'x', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', 'x', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', 'x', 'x', 'x', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', 'x', ' ', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', ' ', 'x', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', 'x', ' ', ' ', 'x', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
]

class Win {
    
    hasCell(rowIdx: number, colIdx: number) {
        if (rowIdx < cells.length) {
            let row = cells[rowIdx];
            if (colIdx < row.length) {
                if (cells[rowIdx][colIdx] === 'x') {
                    return true;
                }
            }
        }

        return false;
    }
}
export const win = new Win();
