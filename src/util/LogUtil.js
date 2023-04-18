/**
 * 彩色打印console
 * @param {any} hint 提示内容
 * @param {any} content 打印内容
 * @param {any} type 打印颜色类型（log,trace,warn，important)
 */
export function colorLog(hint, content, type = 'info') {
    const color = {
        info: '#52c41a',
        warn: '#faad14',
        error: '#f5222d',
        trace: '#66ccff',
        important: '#8E44AD',
    }
    const hintContent = `%c${hint}`
    const hintStyle = `
	  vertical-align: middle;
	  display: flex;
	  height: 100%;
	  line-height: 1.5;
	  background: ${color[type]}; 
	  color: white; 
	  border-radius: 3px 0 0 3px; 
	  font-size: 14px; 
	  padding: 0 5px;
	  box-sizing: border-box;
	  background-clip: border-box;
	`

    console['info'](`${hintContent}`, `${hintStyle}`, content)
}
