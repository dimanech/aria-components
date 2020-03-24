const keyCode = Object.freeze({
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36
});

export default class Feed {
    /**
     * Feed
     * Please see W3C specs https://www.w3.org/TR/wai-aria-practices/#feed
     *
     * This content is licensed according to the W3C Software License at
     * https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
     *
     */
    constructor(feedNode, focusBefore, focusAfter) {
        this.feedNode = feedNode;
        this.focusBefore = focusBefore;
        this.focusAfter = focusAfter;
        this.feedItems = [];
    }

    init() {
        this.addEventListeners();
        this.updateFeedModel();
    }

    reinit(focusBefore, focusAfter) {
        this.updateFeedModel();
        this.focusBefore = focusBefore;
        this.focusAfter = focusAfter;
    }

    destroy() {
        this.feedNode.removeEventListener('keydown', this.handleKeydown);
    }

    addEventListeners() {
        this.handleKeydown = this.handleKeydown.bind(this);
        this.feedNode.addEventListener('keydown', this.handleKeydown);
    }

    handleKeydown(event) {
        const focusedArticle = event.target.matches('[role="article"]')
                ? event.target : event.target.closest('[role="article"]');

        if (!focusedArticle) {
            return;
        }

        const focusedArticleIndex = focusedArticle.getAttribute('aria-posinset');

        let preventEventActions = false;

        switch (event.keyCode) {
            case keyCode.PAGEUP:
                if (focusedArticleIndex > 1) {
                    // decrement, posinset start from 1, array - from 0
                    Feed.focusItem(this.feedItems[focusedArticleIndex - 2]);
                    preventEventActions = true;
                }
                break;
            case keyCode.PAGEDOWN:
                if (this.feedItems.length >= focusedArticleIndex) {
                    // no need to increment, array starts with 0
                    Feed.focusItem(this.feedItems[focusedArticleIndex]);
                    preventEventActions = true;
                }
                break;
            case keyCode.HOME:
                if (event.ctrlKey) {
                    this.focusBeforeFeed();
                    preventEventActions = true;
                }
                break;
            case keyCode.END:
                if (event.ctrlKey) {
                    this.focusAfterFeed();
                    preventEventActions = true;
                }
                break;
        }

        if (preventEventActions) {
            event.stopPropagation();
            event.preventDefault();
        }
    }

    focusBeforeFeed() {
        const focusableElement = this.focusBefore || this.feedItems[0];
        focusableElement.focus();
    }

    focusAfterFeed() {
        const focusableElement = this.focusAfter || this.feedItems[this.feedItems.length];
        focusableElement.focus();
    }

    updateFeedModel() {
        this.feedItems = [];
        [].forEach.call(this.feedNode.children, article => {
            if (article.getAttribute('aria-posinset')) {
                article.setAttribute('tabindex', '0');
                this.feedItems.push(article);
            }
        });
    }

    static focusItem(item) {
        if (!item || !item.focus) {
            return;
        }

        item.focus();
    }
};
