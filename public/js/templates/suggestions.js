import { html } from 'lit-html';
import {repeat} from 'lit-html/directives/repeat';

const myTemplate = () => html`
  <ul>
    ${repeat(items, (i) => i.id, (i, index) => html`
      <li>${index}: ${i.name}</li>`)}
  </ul>
`;

const phraseSuggestion = html`
		<div role="none" class="b-suggestions-section m-guess">
            <a
                role="option"
                aria-label="${Resource.msg('suggestions.selected.wai', 'search', null)} ${Resource.msg('suggestions.title.correction', 'search', null)} {{value}}"
                id="result-item-{{posinset}}"
                class="b-suggestions-option b-suggestions_guess"
                href="${URLUtils.url('Search-Show', 'q')}={{value}}"
                data-ref="result-item-{{posinset}}"
                data-event-click="selectItem"
                data-suggestion-value="{{value}}"
            >
                ${Resource.msg('suggestions.title.correction', 'search', null)}
                <span class="b-suggestions_guess-correction">${suggestions.value}</span>

                <svg class="b-suggestions-option_help" aria-hidden="true" width="70" height="20"><use href="#option-activation-hint"></use></svg>
            </a>
        </div>`;

const productSuggestion = html`
		<div role="none" class="b-suggestions-section m-products">
            <div role="none" class="b-suggestions-title">
                ${Resource.msg('suggestions.title.results', 'search', null)}
                <q>${suggestions.searchPhrase}</q>
            </div>
            ${suggestions.product.products.map((i) => html`
                <a
                    role="option"
                    aria-label="
						${Resource.msg('suggestions.selected.wai', 'search', null)} 
						${Resource.msg('suggestions.title.products', 'search', null)} 
						${suggestions.product.products[i].name}"
                    id="result-item-${suggestions.product.products[i].posinset}"
                    class="b-suggestions-option b-suggestions_product"
                    href="${suggestions.product.products[i].url}"
                    data-ref="result-item-${suggestions.product.products[i].posinset}"
                    data-event-click="selectItem"
                    data-suggestion-value="${suggestions.product.products[i].name}"
                >
                    ${suggestions.product.products[i].imageURL
		? html`
					<picture class="b-suggestions_product-image">
                        <img alt="${suggestions.product.products[i].name}" src="${suggestions.product.products[i].imageURL}" width="30" height="30" />
                    </picture>
					` : ''
}
                    <div class="b-suggestions_product-title">${suggestions.product.products[i].name}</div>
                    <svg class="b-suggestions-option_help" aria-hidden="true" width="70" height="20"><use xlink:href="#option-activation-hint"></use></svg>
                </a>
            `)}
        </div>
	`;

export default html`
<div
    role="none"
    class="b-suggestions-inner"
    data-ref="listboxInner"
>
	${(suggestions.product.phrase && !suggestions.product.phrase.exactMatch)
		? phraseSuggestion : ''
}
	${(suggestions.product.available)
		? productSuggestion : ''
}

    <div role="alert" class="b-suggestions-message" id="search-result-count">
        ${suggestions.total}
    </div>
</div>
`
