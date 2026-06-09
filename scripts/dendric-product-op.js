(() => {
  const SELECTED_CLASS = "is-selected";

  const productMap = {
    "dry-cut": {
      "375 ML": { sku: "88884729-0002", available: true },
      "750 ML": { sku: "88884729-0001", available: true },
      "1.5 L": { sku: "DC1.5", available: false, label: "Coming Soon" },
    },
    "cider---02-03": {
      "375 ML": { sku: "OT375", available: false, label: "Coming Soon" },
      "750 ML": { sku: "OT750", available: false, label: "Coming Soon" },
      "1.5 L": { sku: "OT1.5", available: false, label: "Coming Soon" },
    },
    "cider---03-03": {
      "375 ML": { sku: "", available: false, label: "Coming Soon" },
      "750 ML": { sku: "", available: false, label: "Coming Soon" },
      "1.5 L": { sku: "", available: false, label: "Coming Soon" },
    },
  };

  const ready = (fn) => {
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();
  };

  const queryAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const getText = (element) => (element?.textContent || "").replace(/\s+/g, " ").trim();

  const createElement = (tag, attrs = {}) => {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  const getSlug = () => {
    return (
      document.documentElement.dataset.wfItemSlug ||
      window.location.pathname.split("/").filter(Boolean).pop() ||
      ""
    );
  };

  const getProductConfig = () => productMap[getSlug()] || {};

  const hasAvailableVariant = () => {
    return Object.values(getProductConfig()).some((variant) => variant?.sku && variant.available);
  };

  const ensureOrderPortShell = () => {
    if (!document.querySelector("style[data-op-bootstrap-layer]")) {
      const bootstrap = document.createElement("style");
      bootstrap.setAttribute("data-op-bootstrap-layer", "true");
      bootstrap.textContent =
        '@import url("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css") layer(op-bootstrap);' +
        '.button_main_wrap,.button_main_wrap *{font-family:"Silka Mono",monospace}' +
        ".button_main_text a{color:inherit;text-decoration:inherit}";
      document.head.append(bootstrap);
    }

    if (!document.querySelector("style[data-dendric-op-styles]")) {
      const styles = document.createElement("style");
      styles.setAttribute("data-dendric-op-styles", "true");
      styles.textContent =
        "op-side-cart,op-side-cart-toggle,op-auth-status,op-add-to-cart{font-family:Silka Mono,monospace;color:var(--_theme---text,#140e0d)}" +
        "op-side-cart{z-index:2147483000!important}" +
        "op-side-cart-toggle[data-dendric-native],op-auth-status[data-dendric-native]{position:fixed!important;right:0;top:0;width:1px!important;height:1px!important;opacity:.01!important;overflow:hidden!important;pointer-events:none!important;z-index:-1!important}" +
        ".op-native-add{position:absolute!important;left:-9999rem!important;top:auto!important;width:1px!important;height:1px!important;opacity:.01!important;overflow:hidden!important;pointer-events:none!important}" +
        "[op-card-add].is-disabled{opacity:.65;cursor:not-allowed}" +
        "[op-card-add].is-disabled .clickable_btn{pointer-events:none}";
      document.head.append(styles);
    }

    if (!document.querySelector("op-side-cart")) {
      document.body.append(createElement("op-side-cart", { "btn-start-shopping-url": "/shop" }));
    }

    if (!document.querySelector("op-side-cart-toggle")) {
      document.body.append(createElement("op-side-cart-toggle", { "data-dendric-native": "true" }));
    } else {
      document.querySelector("op-side-cart-toggle")?.setAttribute("data-dendric-native", "true");
    }

    if (!document.querySelector("op-auth-status")) {
      document.body.append(createElement("op-auth-status", { "data-dendric-native": "true" }));
    } else {
      document.querySelector("op-auth-status")?.setAttribute("data-dendric-native", "true");
    }
  };

  const loadOrderPortStartup = () => {
    if (document.querySelector("script[data-dendric-op-startup]")) return;

    const script = document.createElement("script");
    script.src = "https://dendricestate.orderport.net/web-components/startup.js?v=1.7";
    script.setAttribute("data-dendric-op-startup", "true");
    document.body.append(script);
  };

  const clickOrderPortCartToggle = () => {
    const toggle = document.querySelector("op-side-cart-toggle");
    const target = toggle?.querySelector(".shopping-cart-icon,button,a,[role='button'],svg") || toggle;
    target?.click();
  };

  const setupNavOrderPort = () => {
    const welcome = document.querySelector("[op-auth-welcome]");
    const login = document.querySelector("[op-auth-login]");
    const cart = document.querySelector("[op-cart-open]");

    if (welcome && !getText(welcome)) welcome.textContent = "Welcome";

    login?.addEventListener("click", (event) => {
      event.preventDefault();
      const auth = document.querySelector("op-auth-status");
      const link = auth?.querySelector("a[href]");
      if (link) link.click();
    });

    cart?.addEventListener("click", (event) => {
      event.preventDefault();
      clickOrderPortCartToggle();
    });

    cart?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      clickOrderPortCartToggle();
    });
  };

  const setupProductOrderPort = () => {
    const product = document.querySelector(".product_main_wrap, .product_main_content, main");
    if (!product || product.dataset.dendricProductOpReady) return;

    product.dataset.dendricProductOpReady = "true";

    const formatPrice = (value) => {
      const price = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
      if (Number.isNaN(price)) return "";
      return `$${price.toFixed(price % 1 ? 2 : 0)}`;
    };

    const getVariantPrice = (option) => {
      const item = option.closest(".product_variants_item");
      return getText(item?.querySelector("[variant-source='product-price'],[variant-price]"));
    };

    const setButtonText = (text) => {
      const buttonWrap = product.querySelector("[op-card-add], .products_main_addtocart, .product_main_addtocart");
      const textElement = buttonWrap?.querySelector(".button_main_text");
      const clickable = buttonWrap?.querySelector(".clickable_btn,button,a");

      if (textElement) textElement.textContent = text;
      if (clickable) clickable.setAttribute("aria-label", text);
    };

    const getQtyParts = () => {
      const qtyWrap = product.querySelector("[op-card-qty], .products_main_quantity, .product_main_quantity");
      return {
        qtyWrap,
        value: product.querySelector("[op-card-qty-value]") || qtyWrap?.querySelector(".products_quantity_wrap > div"),
      };
    };

    const getQty = () => {
      const { value } = getQtyParts();
      const qty = parseInt(getText(value), 10);
      return Number.isNaN(qty) || qty < 1 ? 1 : qty;
    };

    const setQty = (nextQty) => {
      const { value } = getQtyParts();
      const qty = Math.max(1, Math.min(99, parseInt(nextQty, 10) || 1));
      if (value) value.textContent = qty;
      return qty;
    };

    const getSelectedOption = () => {
      return (
        product.querySelector(`[variant-select].${SELECTED_CLASS}`) ||
        product.querySelector("[variant-select].is-active") ||
        product.querySelector("[variant-select]")
      );
    };

    const getSelectedSize = () => getText(getSelectedOption());

    const getSelection = () => {
      const mapped = getProductConfig()[getSelectedSize()];
      const available = Boolean(mapped?.sku && mapped?.available);

      return {
        sku: mapped?.sku || "",
        available,
        label: available ? "Add to Cart" : mapped?.label || "Coming Soon",
      };
    };

    const createNativeAdds = () => {
      product.querySelectorAll("op-add-to-cart[data-dendric-product-native]").forEach((element) => element.remove());

      Object.entries(getProductConfig()).forEach(([size, variant]) => {
        if (!variant?.sku || !variant.available) return;

        product.append(
          createElement("op-add-to-cart", {
            opsku: variant.sku,
            text: "Add to Cart",
            "qty-visible": "yes",
            "data-dendric-product-native": "true",
            "data-dendric-size": size,
            class: "op-native-add",
          }),
        );
      });
    };

    const getNativeAdd = (sku) => {
      return product.querySelector(`op-add-to-cart[data-dendric-product-native][opsku='${CSS.escape(sku)}']`);
    };

    const syncNativeQty = (native, qty) => {
      const input =
        native?.querySelector("input[formcontrolname='qty']") ||
        native?.querySelector("input[formControlName='qty']") ||
        native?.querySelector("input[type='number'],input[type='text']");

      if (!input) return;

      input.value = qty;
      input.setAttribute("value", qty);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("blur", { bubbles: true }));
    };

    const getNativeSubmit = (native) => {
      return native?.querySelector("button[type='submit'],button.btn-primary,button");
    };

    const waitForNativeSubmit = (native, callback, attempt = 0) => {
      const submit = getNativeSubmit(native);
      if (submit && !submit.disabled) {
        callback(submit);
        return;
      }

      if (attempt < 30) {
        window.setTimeout(() => waitForNativeSubmit(native, callback, attempt + 1), 100);
      }
    };

    const setUnavailableProductState = () => {
      product.querySelector("[variant-lowest]")?.style.setProperty("display", "none");
      product.querySelector("[op-card-qty], .products_main_quantity, .product_main_quantity")?.style.setProperty("display", "none");

      const addWrap = product.querySelector("[op-card-add], .products_main_addtocart, .product_main_addtocart");
      addWrap?.classList.add("is-disabled");
      addWrap?.setAttribute("aria-disabled", "true");
      setButtonText("Coming Soon");
    };

    const syncProduct = () => {
      if (!hasAvailableVariant()) {
        setUnavailableProductState();
        return;
      }

      const selection = getSelection();
      const option = getSelectedOption();
      const priceElement = product.querySelector("[variant-lowest]");
      const addWrap = product.querySelector("[op-card-add], .products_main_addtocart, .product_main_addtocart");
      const clickable = addWrap?.querySelector(".clickable_btn,button,a");
      const { qtyWrap } = getQtyParts();

      setButtonText(selection.label);

      addWrap?.classList.toggle("is-disabled", !selection.available);
      addWrap?.setAttribute("aria-disabled", selection.available ? "false" : "true");
      qtyWrap?.style.setProperty("display", selection.available ? "" : "none");

      if (clickable) {
        clickable.disabled = !selection.available;
        clickable.setAttribute("aria-disabled", selection.available ? "false" : "true");
      }

      if (priceElement && option) {
        const selectedPrice = getVariantPrice(option);
        if (selectedPrice) priceElement.textContent = formatPrice(selectedPrice);
      }

      setQty(getQty());
    };

    const options = queryAll("[variant-select]", product);

    createNativeAdds();

    if (options.length && !options.some((option) => option.classList.contains(SELECTED_CLASS) || option.classList.contains("is-active"))) {
      options[0].classList.add(SELECTED_CLASS);
    }

    options.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        options.forEach((item) => item.classList.remove(SELECTED_CLASS, "is-active"));
        option.classList.add(SELECTED_CLASS);
        syncProduct();
      });
    });

    product.addEventListener("click", (event) => {
      const minus = event.target.closest("[op-card-qty-minus]");
      const plus = event.target.closest("[op-card-qty-plus]");
      const add = event.target.closest("[op-card-add], .products_main_addtocart, .product_main_addtocart");

      if (minus && product.contains(minus)) {
        event.preventDefault();
        setQty(getQty() - 1);
        return;
      }

      if (plus && product.contains(plus)) {
        event.preventDefault();
        setQty(getQty() + 1);
        return;
      }

      if (!add || !product.contains(add)) return;

      event.preventDefault();

      const selection = getSelection();
      if (!selection.available) return;

      const native = getNativeAdd(selection.sku);
      syncNativeQty(native, getQty());
      setButtonText("Adding...");

      waitForNativeSubmit(native, (submit) => {
        submit.click();

        window.setTimeout(() => {
          clickOrderPortCartToggle();
          setButtonText("Add to Cart");
        }, 450);
      });
    });

    syncProduct();
  };

  ready(() => {
    ensureOrderPortShell();
    setupProductOrderPort();
    setupNavOrderPort();
    loadOrderPortStartup();
    window.setTimeout(setupProductOrderPort, 900);
  });
})();

