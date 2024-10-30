/**
 * @typedef {Object} ShopItemObject
 * @property {string} name
 * @property {string} description
 * @property {number | () => number} price
 * @property {number} stock
 * @property {() => void} action
 */

class Shop {
    /** @type {Array<ShopItem>} */
    #items = [];

    constructor() {}
    /**
     * @param {ShopItem} item
     * @returns {number} itemId
     */
    addItem(item) {
        return this.#items.push(item) - 1;
    }

    toString() {
        return this.#items
            .map((item) => item.toString())
            .join("\n");
    }
}

class ShopItem {
    /** @type {string} */
    name;
    /** @type {string} */
    description;
    /** @type {number} */
    price;
    /** @type {number} */
    stock;
    /** @type {number} */
    totalStock;
    /**
     * Once the item is purchased, this function will be called.
     * @type {() => void}
     */
    #action;
    /** @param {ShopItemObject} item */
    constructor(item) {
        this.name = item.name;
        this.description = item.description;
        this.price = item.price;
        this.totalStock = this.stock = item.stock;
        this.#action = item.action;
    }

    toString() {
        let result = `${this.name}: $`;

        if (typeof this.price === "function") {
            result += this.price();
        } else {
            result += this.price;
        }

        if (this.totalStock > 1) {
            result += `\nStock: ${this.stock}/${this.totalStock}\n`;
        }
        result += `- ${this.description}`;

        return result;
    }
}
