import { Terminal } from "./lib/terminal.js";

/**
 * @typedef {Object} ShopItemObject
 * @property {string} name
 * @property {string} description
 * @property {number | () => number} price
 * @property {number} stock -1 = infinite
 * @property {null | (item: ShopItem) => void} action
 * @property {null | boolean | () => boolean} visibility
 */

import { isDefined, namedFunction } from "./lib/helpers.js";

export class Shop {
    /** @type {Array<ShopItem>} */
    #items = [];

    constructor() {}

    buyItem({ state, itemName, itemId }) {
        if (!isDefined(state)) return new Error("No gamestate provided");

        const item = isDefined(itemId)
            ? this.#items[itemId]
            : this.#items.find((item) => item.name === itemName);
        if (!isDefined(item)) return new Error("Item not found");

        return item.buy(state);
    }

    /**
     * @param {ShopItemObject} item
     * @returns {number} itemId
     */
    addItem(item) {
        const itemObject = new ShopItem(item);
        return this.#items.push(item) - 1;
    }

    /** @param {Array<ShopItemObject> | Object<string, ShopItemObject>} items  */
    withItems(items) {
        if (items instanceof Array) {
            this.#items = items.map(ShopItem.prototype.constructor);
        } else {
            for (const [key, value] of Object.entries(items)) {
                value.name = key;
                this.#items.push(new ShopItem(value));
            }
        }
        return this;
    }

    toString() {
        return this.#items
            .map((item) => item.toString())
            .filter(isDefined)
            .join("\n");
    }

    /** @param {{ terminal: Terminal, points$subscription: number }} */
    init({ terminal, points$subscription }) {
        for (const item of this.#items) {
            const fn = namedFunction(item.name, () => {
                terminal.log(item.toString());
            });
            // const { [item.name]: fn } = {
            //     [item.name]: () => {
            //         terminal.log(item.toString());
            //     },
            // };
            terminal.addCommand(fn);
        }
    }
}

class ShopItem {
    /** @type {string} */
    name;
    /** @type {string} */
    description;
    /** @type {number | () => number} */
    price;
    /** @type {number} */
    totalStock;
    /** @type {number} */
    bought;
    /**
     * Once the item is purchased, this function will be called.
     * @type {(item: ShopItem) => void}
     */
    #action;
    /** @type {boolean | () => boolean} */
    #isVisible;
    /** @param {ShopItemObject} item */
    constructor(item) {
        this.name = item.name;
        this.description = item.description;
        this.price = item.price;
        this.totalStock = item.stock || -1;
        this.bought = 0;
        this.#action = item.action;
        this.#isVisible = item.visibility || true;
    }

    buy(state) {
        if (state.points <= 0) {
            return state.terminal.log(`Can't buy ${this.name}!`);
        }

        this.points -= typeof this.price === "function"
            ? this.price()
            : this.price;
        this.bought++;
        this.#action(this);
        return state.terminal.log(`Bought ${this.name}`);
    }

    toString() {
        if (
            typeof this.#isVisible === "function"
                ? !this.#isVisible()
                : !this.#isVisible
        ) return null;
        let result = `${this.name}: $${
            typeof this.price === "function" ? this.price() : this.price
        }`;

        if (this.totalStock !== 1) {
            result += `\n- Bought: ${this.bought}`;
            if (this.totalStock > 1) {
                result += `/${this.totalStock}`;
            }
            console.log(result);
        }
        result += `\n- ${this.description}`;
        return result + "\n";
    }
}
