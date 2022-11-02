import DatastoreMixin from 'maxfactor-vue-datastore';
import collect from 'collect.js';
import { FormMixin } from 'maxfactor-vue-support';

var ShippingData = {
    firstname: '',
    surname: '',
    company: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_county: '',
    address_postcode: '',
    address_country: '',
    address_notes: ''
};

var BillingData = {
    nameoncard: '',
    firstname: '',
    surname: '',
    company: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_county: '',
    address_postcode: '',
    address_country: '',
    address_notes: ''
};

var UserData = {
    id: '',
    email: '',
    firstname: '',
    surname: '',
    company: '',
    telephone: '',
    address: '',
    address_2: '',
    address_3: '',
    address_city: '',
    address_county: '',
    address_postcode: '',
    address_country: '',
    vat_number: '',
    newsletter: '',
    optout: '',
    terms: false,
    shipping: ShippingData,
    billing: BillingData
};

var DiscountData = {
    id: 0,
    code: '',
    description: '',
    expiry: '',
    monetary: null,
    percentage: null,
    error: null
};

var ShippingMethodData = {
    id: 0,
    name: '',
    price: 0.00,
    taxRate: 0.00,
    poa: false
};

var PaymentData = {
    provider: {},
    paymentMethod: {},
    payerid: {},
    result: {}
};

var CountryData = {
    countryCode: 'GB',
    taxApplicable: true
};

var CheckoutStages = {
    DEFAULT: 1,
    SHIPPING: 2,
    PAYMENT: 3,
    SCA: 4,
    COMPLETE: 4,
    PAYPALCOMPLETE: 4
};

var Schema = {
    UserData: UserData,
    ShippingData: ShippingData,
    BillingData: BillingData,
    DiscountData: DiscountData,
    ShippingMethodData: ShippingMethodData,
    PaymentData: PaymentData,
    CountryData: CountryData,
    CheckoutStages: CheckoutStages
};

var placeOrderLabel = 'Place order';

var placingOrderLabel = 'Placing order...';

var Data = {
    mixins: [DatastoreMixin],

    data: function data() {
        return {
            account: {
                loggedIn: false,
                userData: UserData
            }
        };
    },


    /**
     * Load the account data using the Datastore
     */
    mounted: function mounted() {
        this.loadData('account');
    }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var Make = function () {
    function Make() {
        classCallCheck(this, Make);
    }

    createClass(Make, null, [{
        key: "cloneOf",
        value: function cloneOf(object) {
            if (object) {
                return JSON.parse(JSON.stringify(object));
            }
            return {};
        }
    }, {
        key: "ucFirst",
        value: function ucFirst(value) {
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
    }, {
        key: "money",
        value: function money(amount) {
            if (amount <= 0) return parseFloat(0).toFixed(2);
            return parseFloat(amount).toFixed(2);
        }
    }, {
        key: "round",
        value: function round(value) {
            var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

            var rounded = Math.round(value + "e" + decimals);
            return Number(rounded + "e-" + decimals);
        }
    }]);
    return Make;
}();

var MaxfactorAccountMixin = {
    computed: {
        /**
         * User object containing the currently logged in user details. This is
         * accessible application wide.
         */
        userData: {
            get: function get() {
                return this.$root.account.userData;
            },
            set: function set(value) {
                this.$root.account.userData = value;
            }
        },

        /**
         * Global helper to indicate if a user is logged in
         */
        isLoggedIn: {
            get: function get() {
                return this.$root.account.loggedIn;
            },
            set: function set(value) {
                this.$root.account.loggedIn = value;
            }
        }
    },

    methods: {
        /**
         * Set the user state to logged in and assign the userData
         *
         * @param {Object} user
         */
        login: function login(user) {
            this.userData = user;
            this.setCheckoutDefaults();
            this.isLoggedIn = true;
        },


        /**
         * Set the user state to logged out and clear the userData
         */
        logout: function logout() {
            this.userData = {};
            this.isLoggedIn = false;
        },


        /**
         * Pre-fill the shipping address from the account address
         */
        setCheckoutDefaults: function setCheckoutDefaults() {
            if (this.currentCheckout && this.currentCheckout.shipping !== {}) {
                this.currentCheckout.user = collect(Make.cloneOf(this.userData)).except(['error', 'token']).all();
            }
        }
    },

    /**
     * Listen for Login and Logout events in order to set or clear stored account
     * data and state.
     */
    mounted: function mounted() {
        this.$root.$on('login', this.login);
        this.$root.$on('logout', this.logout);
    }
};

var Data$1 = {
    data: function data() {
        return {
            cart: {
                uid: this.generateUid(),

                /**
                 * Cart default values to be appended to any item which is missing
                 * any of the values
                 */
                taxRate: 0.2,
                quantityMin: 1,
                quantityMax: 100,

                taxApplicable: true,
                taxOptional: false,
                taxInclusive: true,

                useShipping: true,

                user: UserData,
                shipping: ShippingData,
                shippingMethod: ShippingMethodData,
                billing: BillingData,
                discount: DiscountData,
                payment: PaymentData,

                /**
                 * List of items in the current Cart
                 */
                items: [],

                notes: '',

                stage: ''
            }
        };
    },


    methods: {
        generateUid: function generateUid() {
            return Math.random().toString(36).slice(2);
        }
    },

    /**
     * Load the cart data using the Datastore
     */
    created: function created() {
        this.loadData('cart');
    }
};

var MaxfactorCartMixin = {
    computed: {
        /**
         * Return the number of items in the current Cart
         */
        itemsInCart: function itemsInCart() {
            return this.itemsCollection.sum('quantity');
        },


        /**
         * Get the total amount for all items in the cart
         */
        cartNetTotal: function cartNetTotal() {
            return parseFloat(this.itemsCollection.sum(function (item) {
                return item.quantity * item.unitPrice;
            })).toFixed(2);
        },
        cartDiscountedNetTotal: function cartDiscountedNetTotal() {
            return parseFloat(this.itemsCollection.sum(function (item) {
                return item.quantity * item.unitPrice;
            }) - this.cartDiscountTotal).toFixed(2);
        },
        cartDiscountPercentage: function cartDiscountPercentage() {
            var discountPercentage = this.cartCollection.discount.percentage || this.calculatedDiscountPercentageFromMonetary || null;

            if (!discountPercentage) return parseFloat(0.00);

            if (discountPercentage === '100.00') {
                this.currentCheckout.payment = { provider: 'free' };
            }

            return parseFloat(discountPercentage).toFixed(2);
        },
        calculatedDiscountPercentageFromMonetary: function calculatedDiscountPercentageFromMonetary() {
            return parseFloat((this.cartCollection.discount.monetary || 0) / this.cartNetTotal * 100).toFixed(2);
        },


        /**
         * Get the monetary discount.  If discount is more than order value, limit to order value
         */
        cartDiscountMonetary: function cartDiscountMonetary() {
            var _this = this;

            if (!this.cartCollection.discount.monetary) return Make.round(0.00);

            var totalItemsIncTax = this.itemsCollection.sum(function (item) {
                return parseFloat(_this.taxTotal(item.quantity * item.unitPrice, item.taxRate, true)).toFixed(2);
            });

            totalItemsIncTax += parseFloat(this.cartShippingTotal(true, true)).toFixed(2);

            var codeRemainder = this.cartCollection.discount.monetary - totalItemsIncTax;

            if (codeRemainder >= 0) {
                this.currentCheckout.payment = { provider: 'free' };
                return this.cartCollection.discount.monetary - codeRemainder;
            }

            if (this.currentCheckout.payment.provider === 'free') this.currentCheckout.payment.provider = '';

            return Make.round(this.cartCollection.discount.monetary);
        },
        cartDiscountTotal: function cartDiscountTotal() {
            if (!this.cartCollection.discount || !this.cartCollection.discount.monetary && !this.cartDiscountPercentage) {
                // No discount is set customer shouldn't be allowed a free order
                if (this.currentCheckout.payment.provider === 'free') {
                    this.currentCheckout.payment.provider = '';
                }

                return parseFloat(0.00);
            }

            if (this.discountType === 'monetary') {
                return parseFloat(this.cartDiscountMonetary || 0.00);
            }

            if (!this.cartDiscountPercentage) return parseFloat(0.00);

            if (this.cartCollection.discount.hasOwnProperty('products') && this.cartCollection.discount.products.length > 0) {
                return Make.round(this.applicableProductsNetTotal * (this.cartDiscountPercentage / 100.0));
            }

            return Make.round(this.cartNetTotal * (this.cartDiscountPercentage / 100.0));
        },
        applicableProductsNetTotal: function applicableProductsNetTotal() {
            var self = this;
            return parseFloat(this.itemsCollection.sum(function (item) {
                return self.cartCollection.hasOwnProperty('discount') && self.cartCollection.discount.hasOwnProperty('products') && self.cartCollection.discount.products.includes(item.productId) ? item.quantity * item.unitPrice : 0;
            })).toFixed(2);
        },


        /**
         * Figure out the discount type
         */
        discountType: function discountType() {
            return this.cartCollection.discount.monetary && this.cartCollection.discount.monetary > 0 ? 'monetary' : 'percentage';
        },
        totalItemsIncTax: function totalItemsIncTax() {
            var _this2 = this;

            var remainingDiscount = parseFloat(this.cartDiscountTotal).toFixed(2);
            var totalItemsIncTax = this.itemsCollection.sum(function (item) {
                var itemTotal = item.quantity * item.unitPrice;
                if (_this2.cartDiscountPercentage && _this2.cartCollection.hasOwnProperty('discount') && _this2.cartCollection.discount.hasOwnProperty('products') && !_this2.cartCollection.discount.products.length) {
                    remainingDiscount -= parseFloat(remainingDiscount - parseFloat(itemTotal * (_this2.cartDiscountPercentage / 100.0)).toFixed(2)).toFixed(2);
                    itemTotal -= parseFloat(itemTotal * (_this2.cartDiscountPercentage / 100.0)).toFixed(2);
                } else {
                    remainingDiscount -= parseFloat(remainingDiscount - parseFloat(itemTotal * (_this2.cartDiscountPercentage / 100.0)).toFixed(2)).toFixed(2);
                    itemTotal -= parseFloat(itemTotal * (_this2.cartDiscountPercentage / 100.0)).toFixed(2);
                }
                return parseFloat(_this2.taxTotal(itemTotal, item.taxRate, true)).toFixed(2);
            });

            totalItemsIncTax = parseFloat(totalItemsIncTax - remainingDiscount).toFixed(2) + parseFloat(this.cartShippingTotalIncTax).toFixed(2);

            return totalItemsIncTax;
        },
        cartSubTotal: function cartSubTotal() {
            return Make.round(parseFloat(this.totalItemsIncTax).toFixed(2), 2);
        },
        cartTaxTotal: function cartTaxTotal() {
            return parseFloat(this.cartSubTotal - this.cartDiscountedNetTotal - this.cartShippingTotal(false)).toFixed(2);
        },
        cartShippingTotalExcTax: function cartShippingTotalExcTax() {
            return this.cartShippingTotal(false);
        },
        cartShippingTotalIncTax: function cartShippingTotalIncTax() {
            return this.cartShippingTotal(true, true);
        },
        taxShouldApply: function taxShouldApply() {
            return this.taxCanApply && this.activeCartCollection.taxInclusive;
        },


        /**
         * Determine if tax can be charged in the shopper's location. Default to true when no
         * location services are included
         */
        taxCanApply: function taxCanApply() {
            if (this.isTaxableLocation === undefined) return true;

            return this.isTaxableLocation;
        },
        taxRate: function taxRate() {
            return this.activeCartCollection.taxRate;
        },


        activeCartCollection: {
            get: function get() {
                return this.$root.cart;
            },
            set: function set(value) {
                this.$root.cart = value;
            }
        },

        /**
         * Helper method to return the full cart object as a Collection
         */
        cartCollection: {
            get: function get() {
                if (window.location.href.indexOf(this.currentCheckout.uid) > -1 && this.currentCheckout.uid) {
                    return this.currentCheckout;
                }

                return this.activeCartCollection;
            }
        },

        shippingCollection: function shippingCollection() {
            return this.cartCollection.shipping;
        },
        shippingMethodCollection: function shippingMethodCollection() {
            return this.cartCollection.shippingMethod;
        },
        billingCollection: function billingCollection() {
            return this.cartCollection.billing;
        },


        /**
         * Helper method to return the items in cart as a Collection object.
         * Uses either the current Checkout or the default Cart.
         */
        itemsCollection: function itemsCollection() {
            return collect(this.cartCollection.items);
        },
        isCartShippingPoa: function isCartShippingPoa() {
            return this.shippingMethodCollection.poa;
        }
    },
    methods: {
        /**
         * Determine if an item is already in the cart. Returns the collection
         * object of the item if it is found.
         *
         * @param {Object} item
         */
        isItemInCart: function isItemInCart(item) {
            var itemInCart = this.itemsCollection.filter(function (cartItem) {
                if (cartItem.id !== item.id) return false;
                if (cartItem.name !== item.name) return false;
                if (JSON.stringify(cartItem).options !== JSON.stringify(item).options) return false;
                if (cartItem.unitPrice !== item.unitPrice) return false;

                return true;
            });

            return itemInCart.count() ? itemInCart.first() : null;
        },


        /**
         * Removes an item from the cart.
         *
         * @param {Object} item
         */
        deleteItemInCart: function deleteItemInCart(item) {
            var findItem = this.isItemInCart(item);
            if (!findItem) return;

            this.emit('removeditemfromcart', item);

            this.activeCartCollection.items = this.itemsCollection.filter(function (cartItem) {
                return JSON.stringify(cartItem) !== JSON.stringify(findItem);
            }).all();
        },
        cartShippingTotal: function cartShippingTotal() {
            var includeTax = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
            var inclusive = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (!includeTax) return Make.money(this.shippingMethodCollection.price || 0.00);

            return Make.money(this.taxTotal(this.shippingMethodCollection.price, this.shippingMethodCollection.taxRate, inclusive) || 0.00);
        },


        /**
         * Increase the quantity of an item in the cart by a specific number,
         * up-to a maximum as specified in the cart data quanityMax
         *
         * @param {Object} item
         * @param {number} amount
         */
        increaseQuantity: function increaseQuantity(item) {
            var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var itemInCart = this.isItemInCart(item);
            if (!itemInCart) return;

            if (itemInCart.quantity < itemInCart.quantityMax) itemInCart.quantity += amount;
        },


        /**
         * Decrease the quantity of an item in the cart by a specific number.
         * Removes the item from the cart if the quantity is less than quanityMin
         *
         * @param {Object} item
         * @param {number} amount
         */
        decreaseQuantity: function decreaseQuantity(item) {
            var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var forceQuantityMin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var itemInCart = this.isItemInCart(item);
            if (!itemInCart) return;

            itemInCart.quantity -= amount;

            if (itemInCart.quantity.valueOf() < (forceQuantityMin || itemInCart.quantityMin)) {
                this.removeItemFromCart(item);
            }
        },


        /**
         * Updates the quantity of an item in the cart to a specific number.
         * Removes the item from the cart if the quantity is less than quanityMin
         * and doesn't allow a quantity greater than the quantityMax.
         *
         * @param {Object} item
         * @param {number} amount
         */
        updateQuantity: function updateQuantity(item, amount) {
            var itemInCart = this.isItemInCart(item);
            if (!itemInCart) return;

            if (amount < itemInCart.quantityMin) this.removeItemFromCart(item);

            itemInCart.quantity = amount > itemInCart.quantityMax ? itemInCart.quantityMax : amount;
        },


        /**
         * Add an item to the cart or increase its quantity if the item is
         * already in the cart by the new quantity amount
         *
         * @param {Object} item
         */
        addItemToCart: function addItemToCart(item) {
            var itemInCart = this.isItemInCart(item);

            if (itemInCart) {
                this.increaseQuantity(item, item.quantity);
                return;
            }

            this.itemsCollection.push(item);
        },


        /**
         * Remove an item from the cart completely
         *
         * @param {Object} item
         */
        removeItemFromCart: function removeItemFromCart(item) {
            return this.deleteItemInCart(item);
        },
        taxTotal: function taxTotal(amount) {
            var rate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var inclusive = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            var taxRate = parseFloat(rate !== null ? rate : this.taxRate).toFixed(2);

            if (window.location.href.includes('/checkout/') && this.taxChargable) {
                return Make.money(parseFloat(inclusive ? amount : 0) + parseFloat(amount) * taxRate);
            }

            if (this.taxCanApply && (inclusive || this.taxShouldApply) && !window.location.href.includes('/checkout/')) {
                return Make.money(parseFloat(inclusive ? amount : 0) + parseFloat(amount) * taxRate);
            }

            return Make.money(amount);
        }
    }
};

var Data$2 = {
    mixins: [DatastoreMixin],
    data: function data() {
        return {
            checkout: {
                checkouts: []
            },
            activeCheckout: {
                user: UserData,
                shipping: ShippingData,
                shippingMethod: ShippingMethodData,
                useShipping: true,
                billing: BillingData,
                discount: DiscountData,
                payment: PaymentData,
                notes: '',
                taxApplicable: true,
                taxOptional: false,
                stage: ''
            },
            checkoutMounted: false,
            nextCheckoutStage: 0
        };
    },


    watch: {
        shippingCountry: {
            handler: function handler(newCountry, oldCountry) {
                if (!this.countryHasChanged(newCountry, oldCountry)) return;

                this.loadCountryDetails();
            }
        }
    },

    methods: {
        countryHasChanged: function countryHasChanged(newCountry, oldCountry) {
            if (!newCountry) return false;
            if (newCountry === oldCountry) return false;

            return true;
        }
    },

    /**
     * Load the checkout data using the Datastore
     */
    created: function created() {
        this.loadData('checkout');
        this.loadData('activeCheckout');
    }
};

var Tell = function () {
    function Tell() {
        classCallCheck(this, Tell);
    }

    createClass(Tell, null, [{
        key: 'inMoney',
        value: function inMoney(amount) {
            return parseFloat(amount).toLocaleString('en-GB', {
                useGrouping: true,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        /**
         * Generates a new "Random" ID to use as the cart/checkout Id.
         * TODO: Reduce length of id to around 10-12?
         */

    }, {
        key: 'randomUid',
        value: function randomUid() {
            return Math.random().toString(36).slice(2);
        }
    }, {
        key: 'serverVariable',
        value: function serverVariable(variableKey) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (!window.server_variables) return defaultValue;

            return window.server_variables[variableKey] || defaultValue;
        }
    }]);
    return Tell;
}();

var MaxfactorCheckoutMixin = {
    data: function data() {
        return {
            action: '',
            waitingForResult: false,
            showMobileCheckoutSummary: false,
            placeOrderLabel: placeOrderLabel,
            placingOrderLabel: placingOrderLabel
        };
    },


    mixins: [FormMixin],

    computed: {
        /**
         * Global reference to all checkouts. Each checkout should be
         * self-contained to allow someone to pay for a quotation or postage
         * charge from the CMS, without this affecting their basket.
         */
        checkoutCollections: function checkoutCollections() {
            return collect(this.$root.checkout.checkouts);
        },


        /**
         * The currentCheckout object should be used for all checkout relted
         * functionality as this is linked to stored checkouts and makes it
         * easy to switch between them.
         */
        currentCheckout: {
            get: function get$$1() {
                return this.$root.activeCheckout;
            },
            set: function set$$1(value) {
                this.$root.activeCheckout = value;
            }
        },

        /**
         * Quickly access to the payment section
         */
        payment: function payment() {
            return this.currentCheckout ? this.currentCheckout.payment : {};
        },


        hasMounted: {
            get: function get$$1() {
                return this.$root.checkoutMounted;
            },
            set: function set$$1(value) {
                this.$root.checkoutMounted = value;
            }
        },

        /**
         * Gather billing details from the form and format as stripe object
         */
        stripeData: function stripeData() {
            return {
                name: this.currentCheckout.billing.nameoncard,
                address_line1: this.currentCheckout.billing.address,
                address_line2: this.currentCheckout.billing.address_2 || '',
                address_city: this.currentCheckout.billing.address_city,
                address_state: this.currentCheckout.billing.county || '',
                address_zip: this.currentCheckout.billing.address_postcode,
                address_country: this.currentCheckout.billing.address_country || ''
            };
        },
        hasPaymentErrors: function hasPaymentErrors() {
            return collect(this.currentCheckout.payment.error).contains('code');
        },
        hasPaymentToken: function hasPaymentToken() {
            return collect(this.currentCheckout.payment.paymentMethod).contains('id');
        },
        shippingCountry: function shippingCountry() {
            return ((this.currentCheckout || {}).shipping || {}).address_country || '';
        },
        useShippingForBilling: function useShippingForBilling() {
            return this.currentCheckout ? this.currentCheckout.useShipping : false;
        },
        taxChargable: function taxChargable() {
            if (!this.currentCheckout.taxApplicable) {
                return false;
            }
            if (this.currentCheckout.taxOptional && this.currentCheckout.user.vat_number) {
                return false;
            }

            return true;
        },
        customCheckoutItems: function customCheckoutItems() {
            return Tell.serverVariable('customCheckoutItems');
        },


        /**
         * Determine if the current checkout is custom or regular cart
         */
        isCustomCheckout: function isCustomCheckout() {
            var checkoutId = Tell.serverVariable('uid');

            if (!checkoutId) return false;
            if (!window.location.href.indexOf(checkoutId)) return false;
            if (this.activeCartCollection.uid === checkoutId) return false;

            return true;
        },


        /**
         * Helper to determine if the user can edit the shipping address during
         * the checkout process.
         */
        canEditShipping: function canEditShipping() {
            return !this.isCustomCheckout;
        },


        nextStage: {
            get: function get$$1() {
                return this.$root.nextCheckoutStage;
            },
            set: function set$$1(stage) {
                this.$root.nextCheckoutStage = stage;
            }
        },

        suppliedUid: function suppliedUid() {
            return Tell.serverVariable('uid');
        },
        suppliedBillingAddress: function suppliedBillingAddress() {
            return Tell.serverVariable('checkout.billing.' + this.suppliedUid);
        },
        billingIsEmpty: function billingIsEmpty() {
            if (this.currentCheckout.billing.surname) return false;
            if (this.currentCheckout.billing.address) return false;
            if (this.currentCheckout.billing.address_postcode) return false;
            if (this.currentCheckout.billing.address_country) return false;

            return true;
        }
    },

    watch: {
        payment: {
            handler: function handler() {
                if (!this.waitingForResult) {
                    this.formIsLoading = false;
                    if (this.placeOrderBtn) {
                        this.placeOrderBtn.disabled = false;
                        this.placeOrderBtn.innerText = placeOrderLabel;
                    }
                    return;
                }

                if (this.hasPaymentErrors) {
                    this.formIsLoading = false;
                    if (this.placeOrderBtn) {
                        this.placeOrderBtn.disabled = false;
                        this.placeOrderBtn.innerText = placeOrderLabel;
                    }
                    return;
                }

                if (!this.hasPaymentToken) {
                    this.formIsLoading = false;
                    if (this.placeOrderBtn) {
                        this.placeOrderBtn.disabled = false;
                        this.placeOrderBtn.innerText = placeOrderLabel;
                    }
                    return;
                }

                this.submitCheckoutToServer();
            },

            deep: true
        },

        useShippingForBilling: function useShippingForBilling(newValue) {
            if (newValue === true) {
                this.syncShippingToBilling();
                return;
            }

            if (this.isCustomCheckout && this.billingIsEmpty) {
                if (this.suppliedBillingAddress) {
                    this.currentCheckout.billing = this.suppliedBillingAddress;
                }

                return;
            }

            if (!this.isCustomCheckout) this.clearBillingAddress();
        },
        customCheckoutItems: function customCheckoutItems(items) {
            this.log(items);
        }
    },

    methods: {
        syncShippingItemToBilling: function syncShippingItemToBilling(item) {
            this.currentCheckout.billing[item] = this.currentCheckout.shipping[item];
        },
        clearBillingItem: function clearBillingItem(item) {
            if ((this.currentCheckout || {}).billing && this.currentCheckout.billing[item]) {
                this.currentCheckout.billing[item] = '';
            }
        },
        syncShippingToBilling: function syncShippingToBilling() {
            var _this = this;

            collect(['firstname', 'surname', 'company', 'telephone', 'address', 'address_2', 'address_3', 'address_city', 'address_postcode', 'address_county', 'address_country', 'address_notes']).map(function (item) {
                return _this.syncShippingItemToBilling(item);
            });
        },
        clearBillingAddress: function clearBillingAddress() {
            var _this2 = this;

            collect(['firstname', 'surname', 'company', 'telephone', 'address', 'address_2', 'address_3', 'address_city', 'address_postcode', 'address_county', 'address_country', 'address_notes']).map(function (item) {
                return _this2.clearBillingItem(item);
            });
        },


        /**
         * Get the content of a specific checkout
         *
         * @param {string} id
         */
        checkoutCollection: function checkoutCollection() {
            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var checkoutId = id || Tell.serverVariable('checkoutId', '');

            return this.checkoutCollections.where('uid', checkoutId);
        },


        /**
         * Creates a new checkout with a cloned set of data
         * (e.g. the current cart)
         *
         * @param {string} id
         * @param {object} data
         */
        createCheckout: function createCheckout(id, data) {
            var newCheckoutData = Make.cloneOf(data);
            if (!this.checkoutCollection(id).count()) {
                if (this.isLoggedIn) newCheckoutData.user = Make.cloneOf(this.userData);
                this.checkoutCollections.push(newCheckoutData);
            } else {
                this.replaceCheckout(id, newCheckoutData);
            }
        },


        /**
         * The the current checkout from one of the available checkouts
         * @param {string} id
         */
        setActiveCheckout: function setActiveCheckout(id) {
            var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (this.currentCheckout.uid === this.checkoutCollection(id).first().uid && !force) {
                return;
            }

            this.currentCheckout = this.checkoutCollection(id).first();
        },


        /**
         * Replace the items in the existing checkout with the new items passed
         * in from the data. Does not replace any other details (as the user
         * might already have started the checkout process and we don't want to
         * replace this data.)
         *
         * @param {string} id
         * @param {object} data
         */
        replaceCheckout: function replaceCheckout(id, data) {
            if (this.currentCheckout.uid !== id) return;

            this.currentCheckout.items = Make.cloneOf(data.items);
            this.currentCheckout.notes = Make.cloneOf(data.notes);
            this.checkoutCollection(id).first().items = Make.cloneOf(data.items);
        },


        /**
         * Ensures the checkout data exists and the url includes the checkout id
         *
         * @param {*} event
         * @param {string} id
         */
        prepareCheckout: function prepareCheckout(event) {
            var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            this.formIsLoading = true;
            this.action = event.target.dataset.url;

            var checkoutId = id || Tell.serverVariable('uid') || this.activeCartCollection.uid;

            if (checkoutId === this.activeCartCollection.uid) {
                this.createCheckout(checkoutId, this.activeCartCollection);
            } else if (!this.checkoutCollection(checkoutId).count()) {
                var newCart = Make.cloneOf(this.activeCartCollection);

                newCart.items = Tell.serverVariable('customCheckoutItems');

                this.createCheckout(checkoutId, newCart);
            }

            this.setActiveCheckout(checkoutId);

            /**
             * Sync the shipping address of the active checkout to the billing address
             */
            if (this.useShippingForBilling) this.syncShippingToBilling();

            this.submitCheckoutToServer();
        },


        /**
         * Process checkout ready to submit to server
         *
         */
        processCheckout: function processCheckout(event) {
            if (this.formIsLoading) {
                return;
            }

            this.placeOrderBtn = event.target;
            this.placeOrderBtn.disabled = true;
            this.placeOrderBtn.innerText = placingOrderLabel;
            this.action = event.target.getAttribute('data-url');
            this.formIsLoading = true;

            if (this.currentCheckout.payment.provider === 'free' || this.currentCheckout.payment.provider === 'paypal') {
                this.submitCheckoutToServer();
            } else {
                /**
                 * Client-side process the checkout and get a stripe token. See the watch
                 * section for the 'payment' watch which acts as a callback when stripe
                 * has returned a token or error.
                 */
                this.currentCheckout.payment.error = {};
                this.waitingForResult = true;
                this.emit('createToken', this.stripeData);
            }
        },


        /**
         * Load items from server variables
         *
         * @param {string} checkoutId
         */
        updateItems: function updateItems(checkoutId) {
            var stageBeingViewed = CheckoutStages[Tell.serverVariable('stage.' + checkoutId).toUpperCase()];

            /**
             *  Don't update front end cart items from
             *  server on first stage if user has cart with checkoutId
             *  This allows users to edit items once checkout started
             */
            if (stageBeingViewed === CheckoutStages.DEFAULT && window.location.href.indexOf(checkoutId) > -1) {
                return;
            }

            if (Tell.serverVariable('checkout.' + checkoutId)) {
                this.currentCheckout.items = Object.values(Tell.serverVariable('checkout.' + checkoutId));
            }
        },


        /**
         * Load user details from server variables
         *
         * @param {string} checkoutId
         */
        updateUserDetails: function updateUserDetails(checkoutId) {
            if (Tell.serverVariable('checkout.user.' + checkoutId)) {
                this.currentCheckout.user = Tell.serverVariable('checkout.user.' + checkoutId);
            }
        },


        /**
         * Load and user details from server variables
         *
         * @param {string} checkoutId
         */
        updateBillingDetails: function updateBillingDetails(checkoutId) {
            if (Tell.serverVariable('checkout.billing.' + checkoutId)) {
                this.currentCheckout.billing = Tell.serverVariable('checkout.billing.' + checkoutId);
            }
        },


        /**
         * Load and user details from server variables by merging the server address
         * into the current checkout address. Does not load null values from server.
         *
         * @param {string} checkoutId
         */
        updateShippingDetails: function updateShippingDetails(checkoutId) {
            if (Tell.serverVariable('checkout.shipping.' + checkoutId)) {
                var serverAddress = collect(Tell.serverVariable('checkout.shipping.' + checkoutId)).filter(function (value) {
                    return value !== null;
                }).all();

                this.currentCheckout.shipping = _extends({}, this.currentCheckout.shipping, serverAddress);
            }
        },


        /**
         * Update discount after server validation
         *
         * @param {string} checkoutId
         */
        updateDiscountDetails: function updateDiscountDetails(checkoutId) {
            if (Tell.serverVariable('checkout.discount.' + checkoutId)) {
                this.currentCheckout.discount = Tell.serverVariable('checkout.discount.' + checkoutId) || {
                    id: 0,
                    code: '',
                    description: '',
                    expiry: '',
                    monetary: null,
                    percentage: null
                };
            }
        },


        /**
         * Load and activate custom checkout if accessed and available
         */
        loadCustomCheckout: function loadCustomCheckout(checkoutId) {
            if (Tell.serverVariable('paypal.' + checkoutId)) {
                this.currentCheckout.payment = Tell.serverVariable('paypal.' + checkoutId);
            }

            if (this.checkoutCollection(checkoutId).count()) {
                if (window.location.href.indexOf(checkoutId) > -1) {
                    this.setActiveCheckout(checkoutId);
                }

                this.updateItems(checkoutId);
                this.updateUserDetails(checkoutId);
                this.updateBillingDetails(checkoutId);
                this.updateShippingDetails(checkoutId);
                this.updateDiscountDetails(checkoutId);

                /**
                 * Don't update active cart if order is complete
                 * Otherwise we would trash users current cart
                 */
                if (Tell.serverVariable('serverStage.' + checkoutId) < CheckoutStages.COMPLETE) {
                    this.activeCartCollection = Make.cloneOf(this.currentCheckout);
                }

                return;
            }

            var newCart = Make.cloneOf(this.activeCartCollection);

            newCart.uid = checkoutId;
            newCart.useShipping = false;
            newCart.items = Tell.serverVariable('checkout.' + checkoutId);
            newCart.shipping = Tell.serverVariable('checkout.shipping.' + checkoutId);
            newCart.billing = Tell.serverVariable('checkout.billing.' + checkoutId);
            newCart.user = Tell.serverVariable('checkout.user.' + checkoutId);
            newCart.discount = Tell.serverVariable('checkout.discount.' + checkoutId) || {
                id: 0,
                code: '',
                description: '',
                expiry: '',
                monetary: null,
                percentage: null

                /**
                 * Don't update active cart if order is complete
                 * Otherwise we would trash users current cart
                */
            };if (Tell.serverVariable('serverStage.' + checkoutId) < CheckoutStages.COMPLETE) {
                this.activeCartCollection = newCart;
            }

            this.createCheckout(checkoutId, newCart);

            if (window.location.href.indexOf(checkoutId) <= -1) return;

            this.setActiveCheckout(checkoutId);
            this.loadCountryDetails();
        },


        /**
         * All client side work is done, pass everything to the server to
         * validate and process
         */
        submitCheckoutToServer: function submitCheckoutToServer() {
            var _this3 = this;

            if (!this.action) {
                this.formIsLoading = false;
                return;
            }
            var checkoutUrl = this.action.replace('UUID', this.currentCheckout.uid);

            this.form.errors = {};

            this.postForm(checkoutUrl, {
                stripe: this.payment,
                checkout: this.currentCheckout
            }).then(function (response) {
                if (!response) {
                    _this3.form.errors = {
                        message: 'No response'
                    };
                    _this3.formIsLoading = false;
                    return;
                }

                /**
                 * If this isn't a payment process continue to next stage
                 */
                if (!response.data.paymentResponse) {
                    _this3.continueCheckout();
                    return;
                }

                if (response.data.paymentResponse.error) {
                    _this3.form.errors = response.data.paymentResponse.error;
                    return;
                }

                /**
                 * Check for Stripe or PayPal success statuses
                 */
                if (response.data.paymentResponse.status === 'requires_source_action' || response.data.paymentResponse.status === 'requires_action') {
                    var redirectUrl = response.data.paymentResponse.next_action.redirect_to_url.url;

                    _this3.progressCheckoutStage();
                    window.location.href = redirectUrl;

                    return;
                }

                if (_this3.hasSuccessfulPayment(response.data.paymentResponse)) {
                    _this3.currentCheckout.payment.result = response.data;
                    _this3.continueCheckout();
                }
            }).catch(function (_ref) {
                var response = _ref.response;

                _this3.form.errors = response.data;
                _this3.formIsLoading = false;
                if (_this3.placeOrderBtn) {
                    _this3.placeOrderBtn.disabled = false;
                    _this3.placeOrderBtn.innerText = placeOrderLabel;
                }
            });
        },


        /**
         * Check for Stripe or PayPal success statuses
         *
         * @param { object } paymentResponse
         */
        hasSuccessfulPayment: function hasSuccessfulPayment(paymentResponse) {
            return paymentResponse.status === 'succeeded' || paymentResponse.freeorder === 'success' || paymentResponse.PAYMENTINFO_0_PAYMENTSTATUS === 'Completed';
        },


        /**
         * Navigate to the next stage of the checkout process
         *
         * @param {string?} id
         */
        continueCheckout: function continueCheckout() {
            var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var checkoutId = id || this.currentCheckout.uid;
            if (!this.action) {
                this.formIsLoading = false;
                return;
            }

            var checkoutUrl = this.action.replace('UUID', checkoutId);
            if (checkoutUrl === window.location.href) {
                this.formIsLoading = false;
                return;
            }

            this.progressCheckoutStage();

            this.action = '';

            /**
             * We set the loading state to true before making a client side redirect to avoid the
             * user clicking the submit button multiple times
             */
            this.formIsLoading = true;
            window.location.href = checkoutUrl;
        },


        /**
         * Toggle checkout order summary section
         * on mobile and tablet devices.
         */
        toggleMobileCheckoutSummary: function toggleMobileCheckoutSummary() {
            this.showMobileCheckoutSummary = !this.showMobileCheckoutSummary;
        },
        setCheckoutStage: function setCheckoutStage() {
            var stage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
            var uid = arguments[1];

            if (!stage) return;

            if (this.handleInvalidCheckout(CheckoutStages[stage.toUpperCase()], uid)) return;

            var stageMethod = 'setCheckoutStage' + Make.ucFirst(stage);

            if (typeof this[stageMethod] === 'function') this[stageMethod]();
        },


        /**
         * Clear up after a paypal checkout has been completed. Called when the page
         * first loads.
         */
        setCheckoutStagePaypalcomplete: function setCheckoutStagePaypalcomplete() {
            this.setCheckoutStageComplete();
        },


        /**
         * Clear up after a checkout has been completed. Called when the page
         * first loads.
         */
        setCheckoutStageComplete: function setCheckoutStageComplete() {
            this.currentCheckout.stage = CheckoutStages.COMPLETE;

            if (this.activeCartCollection.uid === this.currentCheckout.uid) this.deleteCart();
        },


        /**
         * Prepare the third checkout stage (payment details). Called when the
         * page first loads.
         */
        setCheckoutStagePayment: function setCheckoutStagePayment() {
            this.prepareNextStage(CheckoutStages.PAYMENT, CheckoutStages.COMPLETE);
        },


        /**
         * Prepare the second checkout stage for shipping method. Called when the
         * page first loads.
         */
        setCheckoutStageShipping: function setCheckoutStageShipping() {
            this.prepareNextStage(CheckoutStages.SHIPPING, CheckoutStages.PAYMENT);
        },


        /**
         * Prepare the first checkout stage. Called when the page first loads.
         */
        setCheckoutStageDefault: function setCheckoutStageDefault() {
            this.prepareNextStage(CheckoutStages.DEFAULT, CheckoutStages.SHIPPING);
        },


        /**
         * Delete items from the cart and give it a new ID
         */
        deleteCart: function deleteCart() {
            this.activeCartCollection.items = [];
            this.activeCartCollection.uid = Tell.randomUid();
            this.activeCartCollection.stage = 0;
            this.activeCartCollection.shippingMethod = {
                id: 0,
                name: '',
                price: 0.00,
                taxRate: 0.00,
                poa: false
            };
            this.activeCartCollection.payment = {
                provider: {},
                paymentMethod: {},
                payerid: {},
                result: {}
            };
            this.activeCartCollection.discount = {
                id: 0,
                code: '',
                description: '',
                expiry: '',
                monetary: null,
                percentage: null
            };
        },
        progressCheckoutStage: function progressCheckoutStage() {
            if (!this.currentCheckout.stage) this.currentCheckout.stage = 0;

            if (this.currentCheckout.stage < CheckoutStages.COMPLETE && this.nextStage) {
                this.currentCheckout.stage = this.nextStage;
            }
        },


        /**
         * Set the current checkout stage (only if moving forward) and prepare
         * the next stage to allow the user to move forward.
         */
        prepareNextStage: function prepareNextStage(stageFrom, stageTo) {
            this.nextStage = stageTo;

            if (this.currentCheckout.stage < stageFrom) this.currentCheckout.stage = stageFrom;
        },


        /**
         * Check that the current checkout step is allowed to be accessed.
         * Returns false if the stage is valid.
         */
        handleInvalidCheckout: function handleInvalidCheckout() {
            var checkoutView = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : CheckoutStages.DEFAULT;
            var uid = arguments[1];

            var serverStage = Number(Tell.serverVariable('serverStage.' + uid));
            if (!serverStage) serverStage = CheckoutStages.DEFAULT;

            /**
             * Check if there's a payment error
             */
            var url_string = window.location.href;
            var url = new URL(url_string);
            var payment_error = url.searchParams.get("error");
            if (payment_error && this.currentCheckout.stage == CheckoutStages.COMPLETE) {
                this.currentCheckout.stage = CheckoutStages.PAYMENT;
                return false;
            }

            /**
             * Current checkout stage is the same and the stage they are trying to view
             * Can return safely
             */
            if (this.currentCheckout.stage === checkoutView) return false;

            /**
             * Current checkout stage is greater than or equal to the stage they are trying to view
             * AND Current checkout stage less than the complete stage
             */
            if (this.currentCheckout.stage >= checkoutView && this.currentCheckout.stage < CheckoutStages.COMPLETE) return false;

            /**
             * Current server stage is greater than or equal to the stage they are trying to view
             * AND Current server stage less than the complete stage
             * This stops a customer placing an order twice
             */
            if (serverStage >= checkoutView && serverStage < CheckoutStages.COMPLETE) return false;

            /**
             * Allow the customer to load the complete page if server stage is complete
             */
            if (checkoutView === CheckoutStages.COMPLETE && serverStage === CheckoutStages.COMPLETE) return false;

            /**
             * We set the loading state to true before making a client side redirect here to stop
             * the user from performing further actions.
             */
            this.formIsLoading = true;

            /**
             * The user will have been trying to do something funky to get here,
             * such as navigating backwards after competing checkout
             * We should give their cart a new uid to ensure they can't update a completed order
             */
            if (this.activeCartCollection.uid === this.currentCheckout.uid) {
                this.activeCartCollection.uid = Tell.randomUid();
                this.activeCartCollection.stage = 0;
            }

            window.location.href = '/cart';

            return true;
        },
        loadCountryDetails: function loadCountryDetails() {
            var _this4 = this;

            if (!this.shippingCountry) return;

            this.formIsLoading = true;

            this.postForm('/account/location', {
                country: this.shippingCountry
            }).then(function (response) {
                _this4.formIsLoading = false;

                if (response.data.errors) {
                    _this4.form.errors = response.data.errors;
                }

                if (response.data.countryCode && _this4.currentCheckout.stage <= CheckoutStages.SHIPPING) {
                    _this4.$set(_this4, 'currentCheckout', _extends({}, _this4.currentCheckout, {
                        taxApplicable: response.data.taxApplicable,
                        taxOptional: response.data.taxOptional
                    }));
                }
            }).catch(function (error) {
                _this4.formIsLoading = false;
                _this4.form.errors = error;
            });
        }
    },

    /**
     * Load custom checkout items if required
     */
    mounted: function mounted() {
        if (this.hasMounted) return;

        this.hasMounted = true;

        var uid = Tell.serverVariable('uid');

        if (!uid) return;

        /**
         * If user has navigated to page with the browser back button
         * And the server stage for the order is complete
         * Refresh the page, which will trigger a redirection to /cart
         * This stop a user clicking back from the complete page and paying for their order again
         */
        if (!!window.performance && window.performance.navigation.type === 2 && parseInt(Tell.serverVariable('serverStage.' + uid), 10) === CheckoutStages.COMPLETE) {
            window.location.reload();
        }

        this.loadCustomCheckout(uid);

        var stage = Tell.serverVariable('stage.' + uid);

        if (stage) this.setCheckoutStage(stage, uid);
    }
};

var index = {
    install: function install(Vue) {
        Vue.use(DatastoreMixin);
        Vue.mixin(MaxfactorAccountMixin);
        Vue.mixin(MaxfactorCartMixin);
        Vue.mixin(MaxfactorCheckoutMixin);
    }
};

export default index;
export { Data as MaxfactorAccountData, Data$1 as MaxfactorCartData, Schema as MaxfactorCartSchema, Data$2 as MaxfactorCheckoutData };
