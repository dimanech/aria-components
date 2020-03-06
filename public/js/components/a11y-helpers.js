const Grid = require('./Grid');
const FocusHighlighter = require('./FocusHighlighter');

module.exports = () => {
    document.body.classList.remove('m-no_js');

    const highlighterNode = document.querySelector('[data-js-highlighter]');
    if (highlighterNode) {
        new FocusHighlighter(highlighterNode).init();
    }

    const grids = document.querySelectorAll('[role="grid"]');
    grids.forEach(grid => new Grid(grid).init());
};
