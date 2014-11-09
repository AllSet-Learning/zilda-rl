(function(root) {
    'use strict';

    /**
     * Manages a list of valid targets and which is currently selected.
     * @class ValidTargets
     * @constructor
     * @param {Array} [targets=Array] An Array of valid target objects to select from.
     */
    var ValidTargets = function(targets){
        this.targets = targets || [];
        this.sortByRange();
    };

    ValidTargets.prototype = {
        constructor: ValidTargets,

        /**
         * Array of target objects.
         * @type {Array}
         */
        targets: null,

        /**
         * Currently Selected Object.
         * @type {Object}
         * @readOnly
         */
        current: null,

        /**
         * Sets the currently selected target object.
         * @method setCurrent
         * @param {Object} target
         */
        setCurrent: function(target){
            var index = this.targets.indexOf(target);

            if(index !== -1){
                if(this.current){
                    this.current.selected = false;
                }
                target.selected = true;
                this.current = target;
            }
        },

        /**
         * Gets the currently selected target object.
         * @method getCurrent
         * @return {Object}
         */
        getCurrent: function(){
            if(!this.current && this.targets.length){
                this.sortByRange();
                this.setCurrent(this.targets[0]);
            }

            return this.current;
        },

        /**
         * Sets the object after the currently selected object to be the selected object.
         * @method next
         * @return {Object} The new currently selected object.
         */
        next: function(){
            if(!this.current){
                return this.getCurrent();
            }

            var index = this.targets.indexOf(this.current);
            if(index === this.targets.length - 1){
                index = 0;
            } else {
                index++;
            }
            this.setCurrent(this.targets[index]);

            return this.current;
        },

        /**
         * Sets the object before the currently selected object to be the selected object.
         * @method prev
         * @return {Object} The new currently selected object.
         */
        prev: function(){
            if(!this.current){
                return this.getCurrent();
            }

            var index = this.targets.indexOf(this.current);
            if(index === 0){
                index = this.targets.length - 1;
            } else {
                index--;
            }
            this.setCurrent(this.targets[index]);

            return this.current;
        },

        /**
         * Checks if `this.targets` contains `obj`.
         * @method contains
         * @param {Object} obj
         * @return {Bool}
         */
        contains: function(obj){
            for(var i = this.targets.length - 1; i >= 0; i--){
                var target = this.targets[i];
                if(target.value === obj){
                    return true;
                }
            }
            return false;
        },

        /**
         * Gets the closest target object.
         * @method getClosest
         * @return {Object}
         */
        getClosest: function(){
            this.sortByRange();
            if(this.targets[0]){
                return this.targets[0];
            }
        },

        sortByRange: function(){
            this.targets.sort(function(a, b){
                return a.range - b.range;
            });
        }
    };

    root.RL.ValidTargets = ValidTargets;

}(this));