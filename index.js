class Plugin {
  #ctx;

  constructor(ctx) {
    this.#ctx = ctx;
    this.eewSource =
      JSON.parse(localStorage.getItem("eew-source-plugin")) || [];
    this.supportSource = [
      { value: "trem", text: "TREM (僅套用在重播)" },
      { value: "cwa", text: "中央氣象署 (CWA)" },
      { value: "nied", text: "防災科研 (NIED)" },
      { value: "kma", text: "韓國氣象廳 (KMA)" },
      { value: "scdzj", text: "四川省地震局 (SCDZJ)" },
      { value: "fjdzj", text: "福建省地震局 (FJDZJ)" },
    ];
  }

  changeAuthor(TREM) {
    if (this.eewSource && this.eewSource.length > 0) {
      const eewSource =
        JSON.parse(localStorage.getItem("eew-source-plugin")) || [];
      TREM.constant.EEW_AUTHOR = eewSource;
      TREM.constant.SHOW_TREM_EEW = true;
      window.this_constant = TREM.constant.EEW_AUTHOR;
      logger.info(
        "Earthquake early warning source change success!",
        this_constant
      );
    }
  }

  init(TREM) {
    this.changeAuthor(TREM);
    window.addEventListener("storage", (event) => {
      if (event.key === "eew-source-plugin" && event.newValue) {
        this.changeAuthor(TREM);
      }
    });

    const settingButtons = document.querySelector(".setting-buttons");
    const settingContent = document.querySelector(".setting-content");
    if (settingContent) {
      const button = document.createElement("div");
      button.className = "button eew-source";
      button.setAttribute("for", "eew-source-page");
      settingButtons.appendChild(button);
      button.textContent = "EEW Source";

      const options = this.supportSource
        .map(
          (source) => `
        <div>
          <span>${source.text}</span>
          <label class="switch">
            <input id="${source.value}.eew-source-plugin" type="checkbox">
            <div class="slider round"></div>
          </label>
        </div>
      `
        )
        .join("");

      const element = document.createElement("div");
      element.classList.add("setting-options-page", "eew-source-page");
      element.innerHTML = `
        <div class="setting-page-header-title">EEW Source</div>
        <div class="setting-item-wrapper">
          <div class="setting-item-content">
            <span class="setting-item-title">EEW Source</span>
            <span class="description">接收其他管道地震速報</span>
            <div class="setting-option">
              ${options}
            </div>
          </div>
        </div>`;
      settingContent.appendChild(element);
    }
  }

  addCheckBoxEvent(TREM) {
    document.addEventListener("click", async (e) => {
      if (e.target.classList.contains("slider")) {
        const inputElement = e.target.previousElementSibling;
        if (inputElement && inputElement.id.endsWith(".eew-source-plugin")) {
          const key = inputElement.id.split(".")[0];
          if (!TREM.constant.EEW_AUTHOR) {
            TREM.constant.EEW_AUTHOR = [];
          }
          if (!inputElement.checked) {
            if (!TREM.constant.EEW_AUTHOR.includes(key)) {
              TREM.constant.EEW_AUTHOR.push(key);
            }
          } else {
            const index = TREM.constant.EEW_AUTHOR.indexOf(key);
            if (index !== -1) {
              TREM.constant.EEW_AUTHOR.splice(index, 1);
            }
          }
          localStorage.setItem(
            "eew-source-plugin",
            JSON.stringify(TREM.constant.EEW_AUTHOR)
          );
        }
      }
    });
  }

  addClickEvent() {
    const settingOptionsPage = document.querySelectorAll(
      ".setting-options-page"
    );
    const settingButtons = document.querySelectorAll(
      ".setting-buttons .button"
    );
    const page = document.querySelector(".eew-source-page");
    const button = document.querySelector(".eew-source");

    if (button) {
      button.addEventListener("click", () => {
        settingOptionsPage.forEach((item) => {
          item.classList.remove("active");
        });
        page.classList.add("active");

        settingButtons.forEach((item) => {
          item.classList.remove("on");
        });
        button.classList.add("on");
      });
    }
  }

  initializeEEWAuthor(TREM) {
    const storedData =
      JSON.parse(localStorage.getItem("eew-source-plugin")) || [];
    if (!TREM.constant.EEW_AUTHOR) {
      TREM.constant.EEW_AUTHOR = [];
    }
    TREM.constant.EEW_AUTHOR = [...storedData];
    for (const key of storedData) {
      const checkbox = document.getElementById(`${key}.eew-source-plugin`);
      if (checkbox) {
        checkbox.checked = true;
      }
    }
  }

  async onLoad() {
    const { TREM, logger } = this.#ctx;

    this.init(TREM);
    this.addClickEvent();
    this.addCheckBoxEvent(TREM);
    this.initializeEEWAuthor(TREM);
    logger.info("Loading EEW Source plugin...");
  }
}

module.exports = Plugin;
