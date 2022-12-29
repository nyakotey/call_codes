export default class Tracker {
    static #logs = [];
    static #previousValue;

    static log(data) {
        this.#logs.push(data);
    }

    /**
     * @param {string} html returns an array of HTMLElement(s)
     * @param {string} raw returns an array of strings
     * @returns {HTMLElement[] | String[]}
     */
    static getlogs(format) {
        let data;
        switch (format) {
            case "html":
                data = this.#logs.map(this.genNotificationElement);
                break;
            case "raw":
                data = this.#logs;
                break;
            default:
                break;
        }
        this.#logs = [];
        return data;
    }

    static genNotificationElement(log) {
        let notification = document.createElement("div");
        notification.innerHTML = `
        <div class="error_msg">${log}</div>
        <div class="close-icon"><i class="fas fa-x"></i></div>`;
        notification.className = "error";
        notification.addEventListener("click", (e) => {
            if (e.target.closest(".close-icon")) e.currentTarget.remove();
        });
        return notification;
    }

    static get previous() {
        return Tracker.#previousValue;
    }
    
    static set previous(value) {
        if (Tracker.#previousValue !== value) {
            Tracker.#previousValue = value;
        }
    }
}
