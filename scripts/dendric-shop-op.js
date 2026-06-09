(() => {
  const SELECTED_CLASS = "is-selected";

  const productTypeBySlug = {
    "dry-cut": "Dry-Cut",
    "cider---02-03": "Ciders",
    "cider---03-03": "Ciders",
  };

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

  const filterMap = {
    Ciders: ["product-type", "Ciders"],
    "Dry Cut": ["product-type", "Dry-Cut"],
    "Dry-Cut": ["product-type", "Dry-Cut"],
    "1.5 L": ["size", "1.5 L"],
    "375 ML": ["size", "375 ML"],
    "750 ML": ["size", "750 ML"],
  };

  const ready = (fn) => {
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();
  };

  const queryAll = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const getText = (element) => (element?.textContent || "").replace(/\s+/g, " ").trim();
  const setFs = (element, key, value) => element.setAttribute(`fs-list-${key}`, value);

  const createElement = (tag, attrs = {}) => {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  const triggerChange = (element) => {
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const restartFinsweetList = () => {
    const finsweet = window.FinsweetAttributes;
    if (finsweet?.modules?.list?.restart) finsweet.modules.list.restart();
    else finsweet?.load?.("list");
  };

  const getItemSlug = (item) => {
    const link = item.querySelector("a[href*='/products/']");
    if (!link) return "";
    return new URL(link.href, window.location.href).pathname.split("/").filter(Boolean).pop();
  };

  const getDataBox = (item) => {
    let box = item.querySelector(".fs-list-data");
    if (!box) {
      box = document.createElement("b");
      box.hidden = true;
      box.className = "fs-list-data";
      item.append(box);
    }
    return box;
  };

  const setDataField = (box, field, value) => {
    let element = box.querySelector(`[fs-list-field='${field}']`);
    if (!element) {
      element = document.createElement("i");
      element.setAttribute("fs-list-field", field);
      box.append(element);
    }
    element.textContent = value;
  };

  const getProductConfig = (slug) => productMap[slug] || {};
  const hasAvailableVariant = (slug) => {
    return Object.values(getProductConfig(slug)).some((variant) => variant?.sku && variant.available);
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

  const setupProductFilters = () => {
    const shop = document.querySelector(".shop_wrap");
    if (!shop || shop.dataset.dendricShopReady) return;

    const filters = shop.querySelector(".shop_filters");
    const list = shop.querySelector(".products_cms_grid");
    if (!filters || !list) return;

    shop.dataset.dendricShopReady = "true";
    setFs(list, "element", "list");

    let filterForm = filters.querySelector("[fs-list-element='filters']");
    if (!filterForm) {
      filterForm = document.createElement("form");
      setFs(filterForm, "element", "filters");
      filterForm.style.display = "contents";
      while (filters.firstChild) filterForm.append(filters.firstChild);
      filters.append(filterForm);
    }

    filterForm.querySelectorAll("button").forEach((button) => {
      button.type = "button";
    });

    filterForm.querySelectorAll("input[type='checkbox']").forEach((input) => {
      const label = (input.name || input.closest("label")?.textContent || "").trim();
      const mapped = filterMap[label];
      if (!mapped) return;
      setFs(input, "field", mapped[0]);
      setFs(input, "value", mapped[1]);
      setFs(input, "operator", "contain");
    });

    const filterInputs = queryAll("input[fs-list-field]", filterForm);

    shop.querySelectorAll(".shop_category_item").forEach((item) => {
      item.addEventListener("click", (event) => {
        const label = item.textContent.trim();
        const mapped = filterMap[label];
        if (!mapped && label !== "All Products") return;

        event.preventDefault();

        const target = mapped
          ? filterInputs.find((input) => {
              return (
                input.getAttribute("fs-list-field") === mapped[0] &&
                input.getAttribute("fs-list-value") === mapped[1]
              );
            })
          : null;

        filterInputs.forEach((input) => {
          if (input !== target && input.checked) input.click();
        });

        if (target && !target.checked) target.click();
        if (!target && filterInputs[0]) triggerChange(filterInputs[0]);
      });
    });

    list.querySelectorAll(".products_cms_item").forEach((item) => {
      const slug = getItemSlug(item);
      const productType = productTypeBySlug[slug];
      const configuredSizes = Object.keys(getProductConfig(slug));
      const cmsSizes = queryAll("[variant-size]", item).map((element) => getText(element)).filter(Boolean);
      const sizes = cmsSizes.length ? cmsSizes : configuredSizes;

      const box = getDataBox(item);
      if (productType) setDataField(box, "product-type", productType);
      if (sizes.length) setDataField(box, "size", [...new Set(sizes)].join(" "));
    });

    restartFinsweetList();
  };

  const setupPriceFilters = () => {
    const filterForm = document.querySelector(".shop_wrap [fs-list-element='filters']");
    const fromInput = document.querySelector("#From");
    const toInput = document.querySelector("#To");

    if (!filterForm || !fromInput || !toInput || filterForm.dataset.dendricPriceReady) return;

    filterForm.dataset.dendricPriceReady = "true";

    const priceMap = new Map();
    const parsePrice = (element) => parseFloat(element.textContent.replace(/[^0-9.-]/g, ""));
    const priceToken = (price) => `p${Math.round(price * 100)}`;

    queryAll(".shop_wrap .products_cms_item").forEach((item) => {
      const prices = queryAll("[variant-price]", item)
        .map(parsePrice)
        .filter((price) => !Number.isNaN(price));
      if (!prices.length) return;

      const box = getDataBox(item);
      setDataField(box, "pt", [...new Set(prices.map(priceToken))].join(" "));
      prices.forEach((price) => priceMap.set(priceToken(price), price));
    });

    const sortedPrices = [...priceMap].sort((a, b) => a[1] - b[1]);
    if (!sortedPrices.length) return;

    filterForm.querySelector(".ptf")?.remove();

    const hiddenFilters = document.createElement("div");
    hiddenFilters.className = "ptf";
    hiddenFilters.style.cssText = "position:absolute;left:-9999rem;opacity:0;pointer-events:none";

    sortedPrices.concat([["_", Number.NaN]]).forEach(([token, price]) => {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "pt";
      input._price = price;
      setFs(input, "field", "pt");
      setFs(input, "value", token);
      setFs(input, "operator", "contain");
      hiddenFilters.append(input);
    });

    filterForm.append(hiddenFilters);

    const updatePriceFilter = () => {
      const min = parseFloat(fromInput.value) - 0.02;
      const max = parseFloat(toInput.value) + 0.02;
      let hasMatch = false;

      queryAll("input", hiddenFilters).forEach((input) => {
        const inRange = input._price >= min && input._price <= max;
        input.checked = inRange;
        hasMatch = hasMatch || inRange;
      });

      hiddenFilters.lastChild.checked = !hasMatch;
      triggerChange(hiddenFilters.firstChild);
    };

    fromInput.addEventListener("input", updatePriceFilter);
    fromInput.addEventListener("change", updatePriceFilter);
    toInput.addEventListener("input", updatePriceFilter);
    toInput.addEventListener("change", updatePriceFilter);

    updatePriceFilter();
    restartFinsweetList();
  };

  const setupShopOrderPortCards = () => {
    const shop = document.querySelector(".shop_wrap");
    if (!shop || shop.dataset.dendricOpCardsReady) return;

    shop.dataset.dendricOpCardsReady = "true";

    const formatPrice = (value) => {
      const price = parseFloat(String(value).replace(/[^0-9.-]/g, ""));
      if (Number.isNaN(price)) return "";
      return `$${price.toFixed(price % 1 ? 2 : 0)}`;
    };

    const getVariantPrice = (option) => {
      const item = option.closest(".product_variants_item");
      return getText(item?.querySelector("[variant-source='product-price'],[variant-price]"));
    };

    const setButtonText = (card, text) => {
      const buttonWrap = card.querySelector("[op-card-add], .products_main_addtocart");
      const textElement = buttonWrap?.querySelector(".button_main_text");
      const clickable = buttonWrap?.querySelector(".clickable_btn,button,a");

      if (textElement) textElement.textContent = text;
      if (clickable) clickable.setAttribute("aria-label", text);
    };

    const getQtyParts = (card) => {
      const qtyWrap = card.querySelector("[op-card-qty], .products_main_quantity");
      return {
        qtyWrap,
        value: card.querySelector("[op-card-qty-value]") || qtyWrap?.querySelector(".products_quantity_wrap > div"),
      };
    };

    const getQty = (card) => {
      const { value } = getQtyParts(card);
      const qty = parseInt(getText(value), 10);
      return Number.isNaN(qty) || qty < 1 ? 1 : qty;
    };

    const setQty = (card, nextQty) => {
      const { value } = getQtyParts(card);
      const qty = Math.max(1, Math.min(99, parseInt(nextQty, 10) || 1));
      if (value) value.textContent = qty;
      return qty;
    };

    const getSelectedOption = (card) => {
      return (
        card.querySelector(`[variant-select].${SELECTED_CLASS}`) ||
        card.querySelector("[variant-select].is-active") ||
        card.querySelector("[variant-select]")
      );
    };

    const getSelectedSize = (card) => getText(getSelectedOption(card));

    const getSelection = (card) => {
      const slug = getItemSlug(card);
      const size = getSelectedSize(card);
      const mapped = getProductConfig(slug)[size];
      const available = Boolean(mapped?.sku && mapped?.available);

      return {
        slug,
        size,
        sku: mapped?.sku || "",
        available,
        label: available ? "Add to Cart" : mapped?.label || "Coming Soon",
      };
    };

    const createNativeAdds = (card) => {
      const slug = getItemSlug(card);
      const config = getProductConfig(slug);

      card.querySelectorAll("op-add-to-cart[data-dendric-shop-native]").forEach((element) => element.remove());

      Object.entries(config).forEach(([size, variant]) => {
        if (!variant?.sku || !variant.available) return;

        card.append(
          createElement("op-add-to-cart", {
            opsku: variant.sku,
            text: "Add to Cart",
            "qty-visible": "yes",
            "data-dendric-shop-native": "true",
            "data-dendric-size": size,
            class: "op-native-add",
          }),
        );
      });
    };

    const getNativeAdd = (card, sku) => {
      return card.querySelector(`op-add-to-cart[data-dendric-shop-native][opsku='${CSS.escape(sku)}']`);
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

    const setUnavailableCardState = (card) => {
      const tag = card.querySelector(".products_cms_tag, .tag_wrap");
      const tagText = tag?.querySelector(".tag_text, .button_main_text, span, div") || tag;

      if (tag) tag.style.display = "";
      if (tagText) tagText.textContent = "Coming Soon";

      card.querySelector("[variant-lowest]")?.style.setProperty("display", "none");
      card.querySelector(".product_main_variants")?.style.setProperty("display", "none");
      card.querySelector("[op-card-qty], .products_main_quantity")?.style.setProperty("display", "none");
      card.querySelector("[op-card-add], .products_main_addtocart")?.style.setProperty("display", "none");
      card.querySelector(".products_main_comingsoon")?.style.setProperty("display", "none");
      card.querySelectorAll("op-add-to-cart[data-dendric-shop-native]").forEach((element) => element.remove());
    };

    const syncCard = (card) => {
      const slug = getItemSlug(card);
      if (!hasAvailableVariant(slug)) {
        setUnavailableCardState(card);
        return;
      }

      const selection = getSelection(card);
      const option = getSelectedOption(card);
      const priceElement = card.querySelector("[variant-lowest]");
      const addWrap = card.querySelector("[op-card-add], .products_main_addtocart");
      const clickable = addWrap?.querySelector(".clickable_btn,button,a");
      const { qtyWrap } = getQtyParts(card);

      setButtonText(card, selection.label);

      addWrap?.classList.toggle("is-disabled", !selection.available);
      addWrap?.setAttribute("aria-disabled", selection.available ? "false" : "true");
      addWrap?.style.setProperty("display", "");
      qtyWrap?.style.setProperty("display", selection.available ? "" : "none");

      if (clickable) {
        clickable.disabled = !selection.available;
        clickable.setAttribute("aria-disabled", selection.available ? "false" : "true");
      }

      if (priceElement && option) {
        priceElement.style.display = "";
        const selectedPrice = getVariantPrice(option);
        if (selectedPrice) priceElement.textContent = formatPrice(selectedPrice);
      }

      setQty(card, getQty(card));
    };

    shop.querySelectorAll(".products_cms_item").forEach((card) => {
      if (card.dataset.dendricOpCardReady) return;
      card.dataset.dendricOpCardReady = "true";

      const slug = getItemSlug(card);
      const options = queryAll("[variant-select]", card);
      const addWrap = card.querySelector("[op-card-add], .products_main_addtocart");

      if (!hasAvailableVariant(slug)) {
        setUnavailableCardState(card);
        return;
      }

      createNativeAdds(card);

      if (options.length && !options.some((option) => option.classList.contains(SELECTED_CLASS) || option.classList.contains("is-active"))) {
        options[0].classList.add(SELECTED_CLASS);
      }

      options.forEach((option) => {
        option.addEventListener("click", (event) => {
          event.preventDefault();
          options.forEach((item) => item.classList.remove(SELECTED_CLASS, "is-active"));
          option.classList.add(SELECTED_CLASS);
          syncCard(card);
        });
      });

      card.addEventListener("click", (event) => {
        const minus = event.target.closest("[op-card-qty-minus]");
        const plus = event.target.closest("[op-card-qty-plus]");
        const add = event.target.closest("[op-card-add], .products_main_addtocart");

        if (minus && card.contains(minus)) {
          event.preventDefault();
          setQty(card, getQty(card) - 1);
          return;
        }

        if (plus && card.contains(plus)) {
          event.preventDefault();
          setQty(card, getQty(card) + 1);
          return;
        }

        if (!add || !card.contains(add) || add !== addWrap) return;

        event.preventDefault();

        const selection = getSelection(card);
        if (!selection.available) return;

        const native = getNativeAdd(card, selection.sku);
        syncNativeQty(native, getQty(card));
        setButtonText(card, "Adding...");

        waitForNativeSubmit(native, (submit) => {
          submit.click();

          window.setTimeout(() => {
            clickOrderPortCartToggle();
            setButtonText(card, "Add to Cart");
          }, 450);
        });
      });

      syncCard(card);
    });
  };

  ready(() => {
    ensureOrderPortShell();
    setupProductFilters();
    setupShopOrderPortCards();
    setupNavOrderPort();
    loadOrderPortStartup();
    window.setTimeout(setupPriceFilters, 600);
    window.setTimeout(setupShopOrderPortCards, 900);
  });
})();

