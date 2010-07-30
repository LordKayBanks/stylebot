/**
  * stylebot
  * Source: http://github.com/ankit/stylebot
  *
  * Copyright (c) 2010 Ankit Ahuja
  * Dual licensed under GPL and MIT licenses
 **/

var stylebot = {

    status: false,

    selectedElement: null,

    hoveredElement: null,

    selectionStatus: false,
    
    selectionBox: null,

    options: {
        useShortcutKey: true,
        shortcutKey: 69, // 69 is keycode for 'e'
        shortcutMetaKey: 'ctrl',
        mode: 'Basic',
        position: 'Right'
    },
    
    initialize: function(options) {
        this.style.initialize();
        this.setOptions(options);
    },
    
    setOptions: function(options) {
        this.options.useShortcutKey = options.useShortcutKey;
        this.options.shortcutKey = options.shortcutKey;
        this.options.shortcutMetaKey = options.shortcutMetaKey;
        this.options.mode = options.mode;
    },
    
    // toggle stylebot editing status
    toggle: function() {
        if (this.status == true)
            this.disable();
        else
            this.enable();
    },
    
    enable: function() {
        this.attachListeners();
        this.widget.show();
        this.status = true;
        this.chrome.setIcon(true);
        this.enableSelection();
    },
    
    disable: function() {
        stylebot.detachListeners();
        stylebot.widget.hide();
        stylebot.status = false;
        stylebot.chrome.setIcon(false);
        stylebot.style.reset();
        stylebot.disableSelection();
        stylebot.unhighlight();
        stylebot.selectedElement = null;
        stylebot.destroySelectionBox();
    },
    
    highlight: function(el) {
        if (!stylebot.selectionBox)
            stylebot.createSelectionBox();

        stylebot.hoveredElement = el;
        stylebot.selectionBox.highlight(el);
    },
    
    unhighlight: function() {
        stylebot.hoveredElement = null;
        if (stylebot.selectionBox)
            stylebot.selectionBox.hide();
    },
    
    // called when user selects an element
    select: function(el, selector) {
        // preference is given to element over selector
        stylebot.disableSelection();
        if (el)
        {
            stylebot.selectedElement = el;
            selector = SelectorGenerator.generate(el);
            stylebot.highlight(el);
        }
        else if (selector)
        {
            el = $(selector)[0];
            stylebot.selectedElement = el;
            stylebot.highlight(el);
        }
        else
        {
            stylebot.selectedElement = stylebot.hoveredElement;
            selector = SelectorGenerator.generate(stylebot.selectedElement);
        }
        
        stylebot.style.fillCache(selector);
        stylebot.widget.show();
        setTimeout(function() {
            stylebot.style.removeFromStyleElement(stylebot.style.cache.selector);
        }, 100);
    },
    
    toggleSelection: function() {
        if (stylebot.selectionStatus)
        {
            stylebot.select( null, stylebot.style.cache.selector );
            stylebot.disableSelection();
        }
        else
        {
            stylebot.widget.disable();
            stylebot.unhighlight();
            stylebot.enableSelection();
        }
    },
    
    enableSelection: function() {
        stylebot.selectionStatus = true;
        stylebot.widget.cache.headerSelectIcon
        .addClass('stylebot-select-icon-active')
        .attr('title', 'Click to disable selection of element');
    },
    
    disableSelection: function() {
        stylebot.selectionStatus = false;
        stylebot.widget.cache.headerSelectIcon
        .removeClass('stylebot-select-icon-active')
        .attr('title', 'Click to enable selection of element');
    },
    
    createSelectionBox: function() {
        stylebot.selectionBox = new SelectionBox(2, "stylebot-selection");
    },
    
    destroySelectionBox: function() {
        if (stylebot.selectionBox)
        {
            stylebot.selectionBox.destroy();
            delete stylebot.selectionBox;
        }
    },
    
    attachListeners: function() {
        document.addEventListener('mouseover', this.onMouseOver, true);
        document.addEventListener('mousedown', this.onMouseClick, true);
    },
    
    detachListeners: function() {
        document.removeEventListener('mouseover', this.onMouseOver, true);
        document.removeEventListener('mousedown', this.onMouseClick, true);
    },
    
    onMouseOver: function(e) {
        if (e.target.className == "stylebot-selection"
            || stylebot.widget.isBeingDragged
            || stylebot.modal.isVisible
            || stylebot.hoveredElement == e.target
            || !stylebot.selectionStatus
            )
        {
            return true;
        }

        if (stylebot.belongsToStylebot(e.target))
        {
            stylebot.unhighlight();
            return true;
        }
        stylebot.highlight(e.target);
    },

    onMouseClick: function(e) {
        if (stylebot.hoveredElement &&
            stylebot.status &&
            !stylebot.belongsToStylebot(e.target)
            )
        {
            e.preventDefault();
            e.stopPropagation();
            if (stylebot.selectionStatus) {
                stylebot.select();
                return false;
            }
        }
        return false;
    },
    
    belongsToStylebot: function(el) {
        $el = $(el);
        var parent = $el.closest('#stylebot, .stylebot_colorpicker');
        var id = $el.attr('id');
        if (parent.length != 0 || id.indexOf("stylebot") != -1)
            return true;
        return false;
    }
}