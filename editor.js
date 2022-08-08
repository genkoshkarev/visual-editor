let a
class Editor {
    constructor(
        appId = "editor",        
        toolbars = [
            { id: 1, icon: "title", onclick: "editTag", arg: "h2", descr: "alt+1" , key: "Digit1", key2: "altKey" },
            { id: 2, icon: "title", onclick: "editTag", arg: "h3", descr: "alt+2" , key: "Digit2", key2: "altKey" },
            { id: 3, icon: "title", onclick: "editTag", arg: "h4", descr: "alt+3" , key: "Digit3", key2: "altKey" },
            { id: 4, icon: "format_align_left", onclick: "editTag", arg: "p", descr: "alt+4" , key: "Digit4", key2: "altKey" },
            { id: 5, icon: "comment", onclick: "editTag", arg: "blockquote", descr: "alt+5" , key: "Digit5", key2: "altKey" },
            { id: 6, icon: "format_list_bulleted", onclick: "editTag", arg: "li", descr: "alt+6" , key: "Digit6", key2: "altKey" },
            // { id: 7, icon: "edit_note", onclick: "cite", descr: "7" , key: "Digit7", },
            { id: 7, icon: "queue", onclick: "editTag", arg: "kbd", descr: "alt+7" , key: "Digit7", },
            { id: 8, icon: "format_bold", onclick: "boldFormat", arg: "", descr: "ctrl+b" , key: "KeyB", key2: "ctrlKey" },
            { id: 9, icon: "format_italic", onclick: "italicFormat", arg: "", descr: "ctrl+i" , key: "KeyI", key2: "ctrlKey" },
            { id: 10, icon: "format_underlined", onclick: "underlineFormat", arg: "", descr: "ctrl+u" , key: "KeyU", key2: "ctrlKey" },
            { id: 11, icon: "add_link", onclick: "createLink", arg: "", descr: "alt+l" , key: "KeyL", key2: "altKey" },
            { id: 12, icon: "link_off", onclick: "unlink", arg: "", descr: "alt+u", key: "KeyU", key2: "altKey" },
            { id: 13, icon: "clear", onclick: "removeFormat", arg: "", descr: "alt+c", key: "KeyC", key2: "altKey" },
            { id: 14, icon: "delete_sweep", onclick: "deletePost", arg: "", descr: "alt+bspace", key: "Backspace", key2: "altKey" },
        ],
        widgets = [
            { id: 1, icon: "code", onclick: "addCode", descr: "Вставить код", _isFocus: false },
            { id: 2, icon: "insert_photo", onclick: "addImg", descr: "Картинку", _isFocus: false },
        ],
        actions = [
            { name: "Сохранить", click: "savePost" },
            { name: "В черновик", click: "saveStorage", class: "flat" },
            { name: "Показать черновик", click: "getStorage", class: "flat" },
        ],
        styles = {
            font: {size: '20px'},
            colors: {
                "primary": '#00c49f',
                "primary-dark": '#22805b',
                "primary-light": '#f1fdf8',
                "primary-bg": '#ccffea',
            }
        }
    ) {
        this.appId = appId;
        this.app = this.$id(appId);
        this.styles = styles
        this.classEditorItem = this.appId + "-post";

        this.popupMargin = 200;

        this.widgetsId = this.appId + "-widget";
        this.widget = this.#views.render(this.widgetsId);
        this.widgets = widgets;
        this.widgetShow = false;       

        this.postId = appId + "-posts";
        this.post = this.#views.render(this.postId);

        // свойства, которые не сохраняем в массив поста, помечаем подчеркиванием 
        this.postsDefault = {
            class: this.classEditorItem,
            html: "",
            lang: "",
            tag: "p",
            alt: "",
            src: "",
            _isFocus: true,
            _html: "",
            _placeholder: "Введите текст"
        },
        this.posts = [{...this.postsDefault}];

        this.toolbarId = this.appId + "-toolbar";
        this.toolbar = this.#views.render(this.toolbarId, this.appId + "-toolbar");
        this.toolbars = toolbars;
        this.toolbarShow = false;

        this.actionId = this.appId + "-action";
        this.action = this.#views.render(this.actionId);
        this.actions = actions;

        this.imgId = this.appId + "-img";
        this.img = this.#views.render(this.imgId);
        this.imgShow = false;
        this.imgSrc = '';
        
        this.codeId = this.appId + "-code";
        this.code = this.#views.render(this.codeId);
        this.codeShow = false;

        this.render = this.#views.renderEditor()

        // this.codeId = appId + "-code";
        // this.code = this.#views.render(this.codeId);

        // // this.multiButtonId = appId + "-multi-button";
        // this.multiButtonId = "multi-button";
        // this.multiButton = this.#views.render(this.multiButtonId, "multi-button");
        // this.multiButtons = multiButtons;

    }
    
    #views = {
        setStyles: () => {
            this.app.style.fontSize = this.styles.font.size;
            this.#views.setColors();
        },

        setColors: () => {
            const colors = this.styles.colors;
            for (const key in colors) {
                this.app.style.setProperty('--color-' + key, colors[key])
            }
        },

        renderEditor: () => {
            this.#views.setStyles()
            this.#views.toolbar.render();
            this.#views.img.render();
            this.#views.code.render();
            this.#views.post.render();
            this.#views.widget.render();
            this.#views.renderAction();

        },
        isImg: (el) => {
            return (el.tagName === "FIGURE");
        },
        isCode: (el) => {
            return (el.tagName === "PRE");
        },
        isClassEditor: (el) => {
            return el.classList.contains(this.classEditorItem) || el.parentElement.classList.contains(this.classEditorItem);
        },

        post: {
            render: (updateElement = null, id = null) => {
                this.post.innerHTML = "";
                this.posts.forEach((post, id) => this.#views.post.renderItem(post, id));
                this.#views.setFocus();
                this.#views.widget.set()
            },
 
            renderItem: (post, id) => {
                let newEl = (post.tag === 'img') ? this.#views.post.renderImg(post)
                    : this.#views.post.renderTag(post);
                
                newEl.setAttribute("data-id", id);
                newEl.setAttribute("tabindex", "0");
                newEl.classList.add(post.class, this.classEditorItem);
    
                if (post._isFocus) newEl.setAttribute("autofocus", "autofocus");
    
                this.#controllers.handleKeys(event, newEl);
        
                this.post.append(newEl);
            },
            renderTag: (post) => {
                let el = document.createElement(post.tag);
                el.innerHTML = post.html;
                this.#views.post.setAttr(post, el);
                return el;
            },
            setAttr: (post, el) => {
                if (post.tag === 'pre') {
                    el.classList.add("lang" + post.lang);
                    return;
                }
                el.setAttribute("contenteditable", "true");
                el.setAttribute("_placeholder", post._placeholder);
                this.#views.post.setPlaceholder(el);
            },
            renderImg: (post) => {
                let el = document.createElement("figure");
                let img = document.createElement("img");
                let figcaption = document.createElement("figcaption");
                
                img.setAttribute("src", post.src);
                img.setAttribute("alt", post.alt);
                figcaption.innerText = post.alt;

                el.append(img);
                el.append(figcaption);

                return el;
            },
            
            movePopup: (postElement, popupElement, isUnder = false) => {
                let top = (isUnder) ? -50 : 0;
                this[popupElement].style.height = `calc(${this.styles.font.size} * 3.5)`
                this[popupElement].style.left = postElement.offsetLeft + this.popupMargin + "px";
                this[popupElement].style.top = postElement.offsetTop + top + "px";
            },

            isEmpty: (el) => {
                return el.innerHTML === "" && el.tagName !== "IMG"
            },

            setPlaceholder: (el) => {
                if(this.#views.post.isEmpty(el)) {
                    el.classList.add(this.classEditorItem + "-placeholder")
                } else {
                    el.classList.remove(this.classEditorItem + "-placeholder")
                }
            },

            
            fix: (el) => {
                let id = +el.dataset.id
                this.posts[id].html = el.innerHTML
                this.#views.post.setPlaceholder(el)
                this.#views.widget.set(el)
                this.#views.post.console()
            },
            
            getNextTag: (el) => {
                let tag = el.tagName.toLowerCase();
                return tag === "li" ? "li" : "p";
            },
            
            console: () => {
                let posts = []
                this.posts.forEach(post=>{
                    posts.push(post.html)
                })
                console.log(posts);
            },

            
            addImg: () => {
                this.#views.img.hide();
                this.#views.post.render();
            },

            addCode: () => {
                this.#views.code.hide();
                this.#views.post.render();
            },
        },

        toolbar: {
            render: () => {
                this.toolbars.forEach((toolbar) => {
                    this.#views.toolbar.hide();

                    let newEl = document.createElement("button");
                    let classEvents = this.toolbarId + "-item";
                    newEl.classList.add(classEvents);
            
                    let icon = document.createElement("i");
                    icon.classList.add("material-icons", "noactive", classEvents + "-icon");
                    icon.innerHTML = toolbar.icon;
                    newEl.append(icon);
            
                    let p = document.createElement("p");
                    p.innerHTML = toolbar.descr;
                    p.classList.add(classEvents + "-description");
                    newEl.append(p);
            
                    newEl.addEventListener("click", (event) => {
                        event.preventDefault();
                        this.#controllers[toolbar.onclick](this.#views.getFocusElement(), toolbar.arg)
                    });
            
                    this.toolbar.append(newEl);
                });
            },
            hide: () => {
                this.toolbarShow = false;
                this.toolbar.style.display = 'none';
            },
            show: () => {
                this.toolbarShow = true;
                this.toolbar.style.display = 'flex';
            },
        },          
        code: {            
            render: () => {
                this.#views.code.hide();
                this.code.classList.add('popup');

                this.code.innerHTML = `
                <div id="${this.codeId}-wrapper" class="popup-wrapper container">
                    <div class="input__wrapper">
                        <label class="label-form">Введите код</label>
                        <textarea tabindex="0" type="text" placeholder="Введите код" id="${this.codeId}-textarea"></textarea>
                    </div>
                     
                    <div class="input__wrapper">
                        <label class="label-form">Язык</label>
                        <select id="${this.codeId}-lang" type="text" placeholder="Placeholder" tabindex="0">
                            <option value="js">JavaScript</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="go">Go</option>
                            <option value="php">PHP</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                        </select>
                    </div>
            
                    <div class="${this.codeId}-buttons buttons">
                        <div>
                            <button id="${this.codeId}-button-add" tabindex="0" class="${this.codeId}-button">Вставить код</button>
                            <button id="${this.codeId}-button-cancel" tabindex="0" class="${this.codeId}-button">Отмена</button>
                        </div>
                    </div>
                </div>`;
                this.#views.code.addEventClose();
                this.#views.code.addEventPaste();
            },
            addEventPaste: () => {
                this.$id(`${this.codeId}-button-add`).addEventListener("click", (event) => {
                    this.#views.code.add();
                });
            },
            addEventClose: () => {
                this.$id(`${this.codeId}-button-cancel`).addEventListener("click", (event) => {
                    this.#views.code.close();
                });
                this.code.addEventListener("keydown", (event) => {
                    if (event.code === "Escape") {
                        this.#views.code.close();
                    }
                });
            },
            close: () => {
                this.#views.code.hide();
                this.#views.code.clear();
                this.#views.setFocus();
            },
            edit: (id) => {
                this.$id(`${this.codeId}-textarea`).value = this.posts[id].html;
                this.$id(`${this.codeId}-lang`).value = this.posts[id].lang;
                this.#views.code.show();
                this.#views.code.focus();
            },
            add: () => {
                this.#models.post.addCode();
                this.#views.code.close();
                this.#views.post.addCode();
            },
            hide: () => {
                this.codeShow = false;
                this.code.style.display = 'none';
            },
            show: () => {
                this.codeShow = true;
                this.code.style.display = 'flex';
            },
            focus: () => {
                this.$id(`${this.codeId}-textarea`).focus();
            },
            clear: () => {
                this.$id(`${this.codeId}-textarea`).value = '';
            },
        },
        img: {            
            render: () => {
                this.#views.img.hide();
                this.img.classList.add('popup');

                this.img.innerHTML = `
                <div id="${this.imgId}-wrapper" class="popup-wrapper container">

                    <div class="${this.imgId}-fields">
                        <div class="${this.imgId}-paste">
                            <p class="${this.imgId}-label">Вставьте скопированную картинку</p>
                            <input type="text" class="${this.imgId}-paste-input" id="${this.imgId}-paste-input">
                        </div>

                        <p class="${this.imgId}-or">ИЛИ</p>

                        <div class="${this.imgId}-local">
                            <label for="${this.imgId}-local-input" class="${this.imgId}-label">Загрузите файл с компьютера</label>
                            <input type="file" class="${this.imgId}-local-input" id="${this.imgId}-local-input">
                        </div>

                        <p class="${this.imgId}-or">ИЛИ</p>

                        <div class="${this.imgId}-gallery">
                            <p class="${this.imgId}-label">Выберите картинку из вашей галлереи</p>
                            <ul class="${this.imgId}-gallery-list">
                                <li class="${this.imgId}-gallery-list-item">
                                    <img class="${this.imgId}-gallery-list-item-img" src="https://avatars.dzeninfra.ru/get-zen_doc/3892121/pub_5f887afcf18baa2479de120f_5f887c36ff07445a5c119ae0/scale_1200" alt="">
                                </li>
                                <li class="${this.imgId}-gallery-list-item">
                                    <img class="${this.imgId}-gallery-list-item-img" src="https://avatars.dzeninfra.ru/get-zen_doc/2468786/pub_5f887afcf18baa2479de120f_5f88845ff18baa2479f1216c/scale_1200" alt="">
                                </li>
                                <li class="${this.imgId}-gallery-list-item">
                                    <img class="${this.imgId}-gallery-list-item-img" src="https://avatars.dzeninfra.ru/get-zen_doc/3579604/pub_5f887afcf18baa2479de120f_5f887f6e9eb9a66f8b0e0611/scale_1200" alt="">
                                </li>
                                <li class="${this.imgId}-gallery-list-item">
                                    <img class="${this.imgId}-gallery-list-item-img" src="https://avatars.dzeninfra.ru/get-zen_doc/3956291/pub_5f887afcf18baa2479de120f_5f88806f32cf031462ab339a/scale_1200" alt="">
                                </li>
                                <li class="${this.imgId}-gallery-list-item">
                                    <img class="${this.imgId}-gallery-list-item-img" src="https://avatars.dzeninfra.ru/get-zen_doc/3956291/pub_5f887afcf18baa2479de120f_5f88806f32cf031462ab339a/scale_1200" alt="">
                                </li>
                                
                            </ul>
                        </div>
                        <div class="${this.imgId}-action">
                          <button id="${this.imgId}-close" tabindex="0" class="button">Закрыть</button>
                        </div>
                    </div>

                    <div class="${this.imgId}-preview">
                        <img src="" id="${this.imgId}-preview-img">
                        <div class="${this.imgId}-preview-form">
                            <label for="${this.imgId}-preview-input" class="${this.imgId}-label">Название картинки (обязательно)</label>
                            <input type="text" class="${this.imgId}-preview-input" id="${this.imgId}-preview-input">
                        </div>
                        <div class="${this.imgId}-action">
                          <button id="${this.imgId}-preview-add" tabindex="0" class="button">Вставить</button>
                          <button id="${this.imgId}-preview-select" tabindex="0" class="button">Загрузить другую картинку</button>
                          <button id="${this.imgId}-preview-close" tabindex="0" class="button">Закрыть</button>
                        </div>
                    </div>

                  </div>
                </div>`;
        
                this.$(`.${this.imgId}-preview`).style.display = 'none';
                this.#views.img.addEventClose();
                this.#views.img.addEventUpload();
                this.#views.img.addEventPaste();
                this.#views.img.addEventGallery();
                this.#views.img.preview.addEvent();
                
            },
            addEventClose: () => {
                this.$id(`${this.imgId}-close`).addEventListener("click", (event) => {
                    this.#views.img.close();
                });

                this.$id(`${this.imgId}-preview-close`).addEventListener("click", (event) => {
                    this.#views.img.close();
                });

                this.img.addEventListener("keydown", (event) => {
                    if (event.code === "Escape") {
                        this.#views.img.close();
                    }
                });
            },
            addEventGallery: () => {
                let images = this.$$(`.${this.imgId}-gallery-list-item`);
                images.forEach(el => {
                    el.setAttribute("tabindex", '0')
                    el.addEventListener("click", (event) => {
                        this.#views.img.preview.load(event.target.src);
                    });
                    el.addEventListener("keydown", (event) => {
                        if (event.code === "Enter") {
                            console.log(1, event.target.firstElementChild)
                            this.#views.img.preview.load(event.target.firstElementChild.src);
                        }
                    });
                });
            },
            addEventPaste: () => {
                let input = this.$id(`${this.imgId}-paste-input`);
                input.addEventListener("keydown", (event) => {
                    if (event.ctrlKey === true && event.keyCode === 86 || event.code === "Tab") {
                        return
                    } else {
                        event.preventDefault();
                    }
                })
                input.addEventListener("paste", (event) => {
                    this.#views.img.onPasteImg(event);
                })
            },
            onPasteImg: (e) =>  {
                let img = (e.originalEvent || e).clipboardData.files;
                if (img.length) {
                    this.#views.img.preview.onload(img[0]);
                } else {
                    let input = this.$id(`${this.imgId}-paste-input`)
                    input.value = 'В буфере пусто или не картинка';
                    setTimeout(() => input.value = '', 1500)
                    e.preventDefault();
                }
            },
            addEventUpload: () => {
                let input = this.$id(`${this.imgId}-local-input`);
                input.addEventListener("change", (event) => {
                    if (input.length) return;
                    this.#views.img.preview.onload(input.files[0]);
                });
            },
            preview: {
                onload: (img) => {
                    let reader = new FileReader();
                    reader.onload = (event) => {
                        if (reader.readyState === FileReader.DONE) {
                            this.#views.img.preview.load(event.target.result);
                        }
                    };
                    reader.readAsDataURL(img);
                },
                show: () => {
                    this.$(`.${this.imgId}-fields`).style.display = 'none';
                    this.$(`.${this.imgId}-preview`).style.display = 'block';
                    this.#views.img.preview.focus();
                },
                load: (src) => {
                    this.#views.img.clear();
                    this.$id(`${this.imgId}-preview-img`).src = src;
                    this.#views.img.preview.show();
                },
                focus: (src) => {
                    this.$id(`${this.imgId}-preview-input`).focus();
                },
                edit: (id) => {
                    this.$id(`${this.imgId}-preview-img`).src = this.posts[id].src;
                    this.$id(`${this.imgId}-preview-input`).value = this.posts[id].alt;
                    this.#views.img.show();
                    this.#views.img.preview.show();
                },
                hide: () => {
                    this.$(`.${this.imgId}-fields`).style.display = 'block';
                    this.$(`.${this.imgId}-preview`).style.display = 'none';
                },
                delete: () => {
                    this.#views.img.clear();
                    this.#views.img.preview.hide();
                },
                select: () => {
                    this.#views.img.preview.delete();
                    this.#views.img.focus();
                },
                addEvent: () => {
                    this.#views.img.preview.addEventDelete();
                    this.#views.img.preview.addEventAdd();
                },
                addEventDelete: () => {
                    let button = this.$id(`${this.imgId}-preview-select`);
                    this.$click(button, this.#views.img.preview.select);
                },
                addEventAdd: () => {
                    let button = this.$id(`${this.imgId}-preview-add`);
                    this.$click(button, this.#views.img.preview.add);

                    let input = this.$id(`${this.imgId}-preview-input`)
                    input.addEventListener("keydown", (event) => {
                        if (event.code === "Enter") this.#views.img.preview.add();
                    });
                },
                add: () => {
                    this.#models.post.addImg();
                    this.#views.img.preview.delete();
                    this.#views.post.addImg();
                },
            },
            clear: () => {
                this.$(`.${this.imgId}-local-input`).value = ''
                this.$id(`${this.imgId}-paste-input`).value = ''
                this.$id(`${this.imgId}-preview-img`).src = ''
                this.$id(`${this.imgId}-preview-input`).value = ''
            },
            show: () => {
                this.imgShow = true;
                this.img.style.display = 'flex';
            },
            focus: () => {
                this.$id(`${this.imgId}-paste-input`).focus();
            },
            hide: () => {
                this.imgShow = false;
                this.img.style.display = 'none';
            },
            close: () => {
                this.#views.img.hide();
                this.#views.img.preview.delete();
                this.#views.setFocus();
            },
        },
        widget: {
            render: () => {
                this.widgets.forEach((e) => {
                    this.widget.style.zIndex = 1
                    this.widget.style.left = this.post.offsetLeft + this.popupMargin + "px";
                    this.widget.style.top = this.post.offsetTop + "px";
    
                    let newEl = document.createElement("button");
                    let classWidget = this.widgetsId + "-item";
                    newEl.classList.add(classWidget);
                    newEl.setAttribute("data-onclick", e.onclick);
                    newEl.setAttribute("data-id", e.id);
            
                    let icon = document.createElement("i");
                    icon.classList.add(
                        "material-icons",
                        "noactive",
                        classWidget + "-icon"
                    );
                    icon.innerHTML = e.icon;
                    newEl.append(icon);
            
                    let p = document.createElement("div");
                    p.innerHTML = e.descr;
                    p.classList.add(classWidget + "-description");
                    p.classList.add("tooltip-button");
                    newEl.append(p);
            
                    newEl.addEventListener("click", (event) => {
                        // this.#views.updateFocus();
                        event.preventDefault();
                        console.log(e.onclick);
                        this.#controllers[e.onclick]();
                        // this.#models.post.edit(this.#views.getFocusElement(), e.onclick);
                    });
            
                    this.widget.append(newEl);
                });
            },
            set: (el = false) => {
                el = el || this.#views.getFocusElement();
                if (this.#views.post.isEmpty(el)) {
                    this.#views.post.movePopup(el, "widget");
                    this.#views.widget.show()
                } else {
                    this.#views.widget.hide()
                }
            },
            setFocus: (id) => {
                let className = this.widgetsId + "-item";
                let widgets = this.$$("." + className);
                widgets.forEach( e => {
                    if (+e.dataset.id === id) {
                        e.classList.add(className + "-active")
                    } else {
                        e.classList.remove(className + "-active")
                    }
                })
            },
            show: () => {
                this.widgetShow = true;
                this.widget.style.display = 'flex';
            },
            hide: () => {
                this.widgetShow = false;
                this.widget.style.display = 'none';
            },
        },

        renderAction: () => {
            this.actions.forEach((e) => {
              let newEl = document.createElement("button");
              let classActions = this.actionsId + "-item";
            //   newEl.classList.add(classActions, "button", "medium");
            //   if (e.class) newEl.classList.add("flat");
            //   this.action.classList.add(classActions, "buttons");
              newEl.innerHTML = e.name;
            //   if (e.click === "save") {
                // newEl.classList.add("disabled");
                // newEl.classList.add("bottom");
                // newEl.classList.add("tooltip");
                // newEl.classList.add("dark");
                // newEl.setAttribute("data-tooltip", "Напишите не менее трех абзацев");
            //   }
      
              newEl.addEventListener("click", (event) => {
                event.preventDefault();
                this.#usersFunction[e.click]();
              });
      
              this.action.append(newEl);
            });
          },

        updateFocus: (el) => {
            if (el && this.#views.isClassEditor(el)) {
                let id = +el.dataset.id;
                this.#models.post.updateFocus(id)
                this.#views.clearAutofocus();
                el.setAttribute("autofocus", "autofocus");
            }
        },

        clearAutofocus: () => {
          this.#views.getFocusElements().forEach((e) => {
            e.removeAttribute("autofocus");
          });
        },

        render: (elementId, className) => {
            let newEl = document.createElement("div");
            newEl.id = elementId;
            if (className) newEl.classList.add(className);
            this.app.append(newEl);
            return newEl;
        },

        setFocus: (el = false) => {
            if (!el) {
                el = this.#views.getFocusElement();
            }
            el.setAttribute("autofocus", "autofocus");
            el.focus();
        },

        getFocusElement: () => {
            return this.$(`.${this.classEditorItem}[autofocus="autofocus"]`);
        },

        getFocusElements: () => {
          return this.$$(`.${this.classEditorItem}[autofocus="autofocus"]`);
        },
        getFocusElementId: () => {
          return +this.#views.getFocusElement().dataset.id;
        },
        
    }

    #controllers = {

        handleKeys: (event, el) => {
            document.addEventListener("selectionchange", () => {
                const selection = window.getSelection();
                const active = selection.baseNode.parentElement;
                if (this.#controllers.isSelected(active, selection)) {
                    this.#views.post.movePopup(active, "toolbar", true);
                    this.#views.toolbar.show();
                } else {
                    this.#views.toolbar.hide();
                }
            });
            el.addEventListener("click", (event) => {
                this.#controllers.handleClick(el);
            });
            el.addEventListener("dblclick", (event) => {
                this.#controllers.handleDblClick(el);
            });
    
            el.addEventListener("keydown", (event) => {
                this.#controllers.handleKeydown(event, el);
            });

            el.addEventListener("keyup", (event) => {
                this.#controllers.handleKeyUp(event, el);
            })
        },

        isSelected: (el, selection) => {
            const text = selection.toString();
            return this.#views.isClassEditor(el) && !this.#views.isCode(el) && !this.#views.isImg(el) && text.length;
        },
        handleClick: (el) => {
            let active = document.activeElement;
            if (this.#views.isClassEditor(active)) {
                this.#views.updateFocus(active)
                this.#views.widget.set(el)
            }
        },
        handleDblClick: (el) => {
            let active = document.activeElement;
            if (this.#views.isClassEditor(active)) {
                this.#controllers.handleDblClickImg(el);
                this.#controllers.handleDblClickCode(el);
            }
        },
        handleDblClickImg: (el) => {
            if (this.#views.isImg(el)) {
                this.#views.img.preview.edit(el.dataset.id);
            }
        },
        handleDblClickCode: (el) => {
            if (this.#views.isCode(el)) {
                this.#views.code.edit(el.dataset.id);
            }
        },

        handleKeyUp: (event, el) => {
            if (event.code != "Enter") {
                this.#views.post.fix(el)
            }
        },

        handleKeydown: (event, el) => {
            if (event.code == "Tab") {
                this.#controllers.navigationToPost(event, el);
            }
            // else if (event.code == "Backspace" && event.altKey) {
            //     this.#controllers.deletePost(el);
            // }
            else if (event.code == "Enter") {
                this.#controllers.addNew(event, el);
            }
            else if (event.code == "ArrowRight" || event.code == "ArrowLeft") {
                this.#controllers.setFocusWidget(event.code);
            }
            else {
                this.#controllers.checkKey(event, el);
            }
            
        },

        checkKey: (event, el) => {
            if (event.code === 'ShiftLeft') return;
            if (this.#views.isImg(el)) {
                this.#views.img.preview.edit(el.dataset.id);
            } else if (this.#views.isCode(el)) {
                this.#views.code.edit(el.dataset.id);
            } else {
                this.#controllers.checkToolbarKeys(event)
            }
        },
        
        checkToolbarKeys: (event) => {
            // console.log(event)
            if (event.altKey || event.ctrlKey) {
                let e = this.toolbars.find(e => this.#controllers.isToolbarKeys(event, e));
                if (e) {
                    event.preventDefault();
                    this.#controllers[e.onclick](this.#views.getFocusElement(), e.arg)
                }
            }
        },
        
        isToolbarKeys: (event, e) => {
            const isKey = (e.key === event.code);
            const isAlt = (e.key2 === 'altKey' && event.altKey);
            const isCtrl = (e.key2 === 'ctrlKey' && event.ctrlKey);
            return isKey && (isAlt || isCtrl)

        },
        setFocusWidget: (key) => {
            let id = this.#controllers.getFocusWidgetId(key);
            this.#views.widget.setFocus(id);
            this.#models.widget.setFocus(id);
        },

        getFocusWidgetId: (key) => {
            let widgets = this.widgets;
            let index = widgets.findIndex(e => e._isFocus === true)
            if (key === "ArrowRight") {
                if (index === -1 || index === widgets.length-1) return widgets[0].id;
                return widgets[index+1].id;
            } else {
                if (index === -1 || index === 0) return widgets.at(-1).id;
                return widgets[index-1].id;                
            }
        },
        
        deletePost: (el) => {
            if (this.posts.length === 1) {
                this.#views.setFocus();
                return;
            }
            this.#models.post.delete(el)
            this.#views.post.render();
            return;
        },

        addNew: (event, el) => {
            event.preventDefault();
            let widget = this.widgets.find(e => e._isFocus === true)
            if (this.widgetShow && widget) {
                this.#controllers.startWidget(event.target, widget.onclick);
            } else {
                this.#models.post.add(event.target);
            }
        },
        startWidget: (el, action) => {
            this.#controllers[action](el)
        },
        
        editTag: (el, action = null) => {
            this.#models.post.edit(el, action);
            this.#views.post.render();
        },
        createLink: (el, action = null) => {
            let link = prompt("Введите ссылку", "http://");
            if (link && link !== "" && link !== "http://") {
                document.execCommand("createLink", false, link);
            }
            this.#views.post.fix(el);
        },
        unlink: (el, action = null) => {
            let selection = document.getSelection().toString();
            document.execCommand("unlink", false, selection);
            this.#views.post.fix(el);
        },
        removeFormat: (el, action = null) => {
            let selection = document.getSelection().toString();
            document.execCommand("removeFormat", false, selection);
            this.#views.post.fix(el);
        },
        boldFormat: (el, action = null) => {
            document.execCommand("bold", false);
            this.#views.post.fix(el);
        },
        italicFormat: (el, action = null) => {
            document.execCommand("italic", false);
            this.#views.post.fix(el);
        },
        underlineFormat: (el, action = null) => {
            document.execCommand("underline", false);
            this.#views.post.fix(el);
        },

        addImg: (el) => {
            event.preventDefault();
            this.#views.img.show();
            this.#views.img.focus();
        },
        addCode: (el) => {
            event.preventDefault();
            this.#views.code.show();
            this.#views.code.focus();
        },
        addNewPost: (event, el) => {
            event.preventDefault();
            this.#models.post.add(event.target);
        },

        navigationToPost: (event, el) => {
            let active = (event.shiftKey) ? el.previousElementSibling : el.nextElementSibling;
            this.#views.updateFocus(active)
        },


    }
    
    #models = {
        post: {
            edit: (el, action = null) => {
                let id = +el.dataset.id;
                this.posts[id].tag = action;
            },
    
            add: (el, elem = null) => {
                let id = +el.dataset.id;
                let newId = id + 1;
                let postsDefault = {...this.postsDefault}
                let item = {
                    ...postsDefault,
                    tag: this.#views.post.getNextTag(el)
                };
                if (elem) item.tag = "li";
                this.#models.post.clearFocus();
                this.posts.splice(newId, 0, item);
                this.#views.post.render();
            },

            addImg: () => {
                let post = this.#models.post.getFocus();
                post.tag = 'img';
                post.src = this.$id(`${this.imgId}-preview-img`).src;
                post.alt = this.$id(`${this.imgId}-preview-input`).value;
            },

            addCode: () => {
                let post = this.#models.post.getFocus();
                post.tag = 'pre';
                post.html = this.$id(`${this.codeId}-textarea`).value;
                post.lang = this.$id(`${this.codeId}-lang`).value;
            },
            
            delete: (el) => {
                let id = +el.dataset.id;
                let newId = this.#models.post.isLastIndex(id) ? id - 1 : id;
                this.posts.splice([id], 1);
                this.#models.post.updateFocus(newId);
            },
    
            isLastIndex: (id) => {
                return id === this.posts.length-1;
            },
    
            updateFocus: (id) => {
                this.#models.post.clearFocus();
                this.posts[id]._isFocus = true;
            },

            getFocus: () => {
                return this.posts.find((post) => (post._isFocus == true));
            },
    
            clearFocus: () => {
                this.posts.forEach((post) => (post._isFocus = false));
            },
        },

        widget: {
            setFocus: (id) => {
                let widgets = this.widgets;
                widgets.forEach( e => {
                    e._isFocus = (e.id === id)
                })
            }
        }
    }

    // вспомогательные функции для работы с элементами
    $id = (name) => {
        return document.getElementById(name);
    }

    $ = (name) => {
        return document.querySelector(name);
    }

    $$ = (name) => {
        return document.querySelectorAll(name);
    }

    $for = (list, func) => {
        for (let item of this.$inEls(list)) {
            func(item);
        }
    }

    $elNext = (e) => {
        return e.nextElementSibling;
    }

    $isStr = (s) => {
        return typeof s === "string";
    }

    // если в инпут строка то находим элементы
    $getEl = (s) => {
        return this.$isStr(s) ? this.$(s) : s;
    }

    $getEls = (s) => {
        return this.$isStr(s) ? this.$$(s) : s;
    }

    $getEls = (s) => {
        return this.$isStr(s) ? this.$$(s) : s;
    }

    // вспомогательные функции для работы со стилями
    $style = (e, prop, v) => {
        this.$getEl(e).style.setProperty(prop, v);
    }

    $classAdd = (e, name) => {
        e.classList.add(name);
    }

    $classDel = (e, name) => {
        e.classList.remove(name);
    }

    $classToggle = (e, name) => {
        e.classList.toggle(name);
    }

    $hideToggle = (e) => {
        e = this.$getEl(e);
        let display = e.style.display;
        e.style.display = display === "none" || display === "" ? "block" : "none";
    }
    
    // вспомогательные функции для работы с событиями
    $click = (e, func) => {
        this.$getEl(e).addEventListener("click", func);
    }

    $onload = (e, func) => {
        this.$getEl(e).addEventListener("DOMContentLoaded", func);
    }

    $input = (e, func) => {
        this.$getEl(e).addEventListener("input", func);
    }

    $checkStorage = () => {
        if (this.$getStorage() === JSON.stringify(this.posts)) {
            alert('черновик сохранен')
        } else {
            alert('Ошибки при сохранение в localStorage')
        }
    }

    $setStorage = () => {
        localStorage.setItem("posts", JSON.stringify(this.posts));
        this.$checkStorage();
    }

    $getStorage = () => {
        return localStorage.getItem("posts");
    }

    #usersFunction = {
        saveStorage: () => {
            this.$setStorage()
        },

        getStorage: () => {
            let data = this.$getStorage();
            let posts = JSON.parse(data);
            console.table(posts);
        },

        savePos: () => {
            this.$setStorage()
            if (this.posts.length < 3) {
                alert('Статья должна иметь более трех абзацев (картинок, заголовков)')
            }
        }
    }
}