/**
 * demo.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2019, Codrops
 * http://www.codrops.com
 */
{
    const MathUtils = {
        lineEq: (y2, y1, x2, x1, currentVal) => {
            // y = mx + b 
            var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
            return m * currentVal + b;
        },
        lerp: (a, b, n) =>  (1 - n) * a + n * b
    };
    
    class Renderer {
        constructor(options, material) {
            this.options = options;
            this.material = material;
            for (let i = 0, len = this.options.uniforms.length; i <= len-1; ++i) {
                this.material.uniforms[this.options.uniforms[i].uniform].value = this.options.uniforms[i].value;
            }
            for (let i = 0, len = this.options.animatable.length; i <= len-1; ++i) {
                this[this.options.animatable[i].prop] = this.options.animatable[i].from;
                this.material.uniforms[this.options.animatable[i].prop].value = this[this.options.animatable[i].prop];
            }
            this.currentScroll = window.pageYOffset;
            this.maxScrollSpeed = 80;
            requestAnimationFrame(() => this.render());
        }
        render() {
            const newScroll = window.pageYOffset;
            const scrolled = Math.abs(newScroll - this.currentScroll);
            for (let i = 0, len = this.options.animatable.length; i <= len-1; ++i) {
                this[this.options.animatable[i].prop] = MathUtils.lerp(this[this.options.animatable[i].prop], Math.min(MathUtils.lineEq(this.options.animatable[i].to, this.options.animatable[i].from, this.maxScrollSpeed, 0, scrolled), this.options.animatable[i].to), this.options.easeFactor);
                this.material.uniforms[this.options.animatable[i].prop].value = this[this.options.animatable[i].prop];
            }
            this.currentScroll = newScroll;
            requestAnimationFrame(() => this.render());
        }
    }
    
    class LiquidDistortMaterial {
        constructor(options) {
            this.options = {
                uniforms: [
                    {
                        uniform: 'uSpeed', 
                        value: 0.5
                    },
                    {
                        uniform: 'uVolatility', 
                        value: 0
                    },
                    {
                        uniform: 'uSeed', 
                        value: 0.4
                    }
                ],
                animatable: [
                    {prop: 'uVolatility', from: 0, to: 0.9}
                ],
                easeFactor: 0.05
            };
            Object.assign(this.options, options);
            this.material = new Blotter.LiquidDistortMaterial();
            new Renderer(this.options, this.material);
            return this.material;
        }
    }

    class RollingDistortMaterial {
        constructor(options) {
            this.options = {
                uniforms: [
                    {
                        uniform: 'uSineDistortSpread', 
                        value: 0.354
                    },
                    {
                        uniform: 'uSineDistortCycleCount', 
                        value: 5
                    },
                    {
                        uniform: 'uSineDistortAmplitude', 
                        value: 0
                    },
                    {
                        uniform: 'uNoiseDistortVolatility', 
                        value: 0
                    },
                    {
                        uniform: 'uNoiseDistortAmplitude', 
                        value: 0.168
                    },
                    {
                        uniform: 'uDistortPosition', 
                        value: [0.38,0.68]
                    },
                    {
                        uniform: 'uRotation', 
                        value: 48
                    },
                    {
                        uniform: 'uSpeed', 
                        value: 0.421
                    }
                ],
                animatable: [
                    {prop: 'uSineDistortAmplitude', from: 0, to: 0.5}
                ],
                easeFactor: 0.05
            };
            Object.assign(this.options, options);
            this.material = new Blotter.RollingDistortMaterial();
            new Renderer(this.options, this.material);
            return this.material;
        }
    }

    class ChannelSplitMaterial {
        constructor(options) {
            this.options = {
                uniforms: [
                    {
                        uniform: 'uOffset', 
                        value: 0
                    },
                    {
                        uniform: 'uRotation', 
                        value: 90
                    },
                    {
                        uniform: 'uApplyBlur', 
                        value: 1.0
                    },
                    {
                        uniform: 'uAnimateNoise', 
                        value: 1.0
                    }
                ],
                animatable: [
                    {prop: 'uOffset', from: 0.02, to: 0.8},
                    {prop: 'uRotation', from: 90, to: 100}
                ],
                easeFactor: 0.05
            };
            Object.assign(this.options, options);
            this.material = new Blotter.ChannelSplitMaterial();
            new Renderer(this.options, this.material);
            return this.material;
        }
    }

    class Material {
        constructor(type, options = {}) {
            let material;
            switch (type) {
                case 'LiquidDistortMaterial':
                    material = new LiquidDistortMaterial(options);
                    break;
                case 'RollingDistortMaterial':
                    material = new RollingDistortMaterial(options);
                    break;
                case 'ChannelSplitMaterial':
                    material = new ChannelSplitMaterial(options);
                    break;
            }
            return material;
        }
    }

    class BlotterEl {
        constructor(el, options) {
            this.DOM = {el: el};
            this.DOM.textEl = this.DOM.el.querySelector('span.content__text-inner');
            this.style = {
                family : "'Goblin One',serif",
                size : 130,
                paddingLeft: 40,
                paddingRight: 40,
                paddingTop: 40,
                paddingBottom: 40,
                fill : "#c69f64"
            };
            Object.assign(this.style, options.style);

            this.material = new Material(options.type, options);
            this.text = new Blotter.Text(this.DOM.textEl.innerHTML, this.style);
            this.blotter = new Blotter(this.material, {texts: this.text});
            this.scope = this.blotter.forText(this.text);
            this.DOM.el.removeChild(this.DOM.textEl);
            this.scope.appendTo(this.DOM.el);

            const observer = new IntersectionObserver(entries => entries.forEach(entry => this.scope[entry.isIntersecting ? 'play' : 'pause']()));
            observer.observe(this.scope.domElement);
        }
    }

    const config = [
        {
            type: 'LiquidDistortMaterial',
            uniforms: [{uniform: 'uSpeed', value: 0.6},{uniform: 'uVolatility', value: 0},{uniform: 'uSeed', value: 0.4}],
            animatable: [
                {prop: 'uVolatility', from: 0, to: 0.4}
            ],
            easeFactor: 0.05
        },
        {
            type: 'LiquidDistortMaterial',
            uniforms: [{uniform: 'uSpeed', value: 0.9},{uniform: 'uVolatility', value: 0},{uniform: 'uSeed', value: 0.1}],
            animatable: [
                {prop: 'uVolatility', from: 0, to: 2}
            ],
            easeFactor: 0.1
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.354
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 5
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0.168
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0.38,0.68]
                },
                {
                    uniform: 'uRotation', 
                    value: 48
                },
                {
                    uniform: 'uSpeed', 
                    value: 0.421
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.5}
            ],
            easeFactor: 0.15
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.54
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 2
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0.15
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0.18,0.98]
                },
                {
                    uniform: 'uRotation', 
                    value: 90
                },
                {
                    uniform: 'uSpeed', 
                    value: 0.3
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.2}
            ],
            easeFactor: 0.05
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.44
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 5
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0.85
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0,0]
                },
                {
                    uniform: 'uRotation', 
                    value: 0
                },
                {
                    uniform: 'uSpeed', 
                    value: .1
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.2}
            ],
            easeFactor: 0.35
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.74
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 7
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0.15
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0.1,0.5]
                },
                {
                    uniform: 'uRotation', 
                    value: 20
                },
                {
                    uniform: 'uSpeed', 
                    value: 0.7
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.2}
            ],
            easeFactor: 0.1
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.084
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 2.2
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0.35,0.37]
                },
                {
                    uniform: 'uRotation', 
                    value: 180
                },
                {
                    uniform: 'uSpeed', 
                    value: 0.94
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.13}
            ],
            easeFactor: 0.15
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 0
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0.01
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0.126
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0.3,0.3]
                },
                {
                    uniform: 'uRotation', 
                    value: 180
                },
                {
                    uniform: 'uSpeed', 
                    value: 0.13
                }
            ],
            animatable: [
                {prop: 'uNoiseDistortVolatility', from: 0.01, to: 200},
                {prop: 'uRotation', from: 180, to: 270}
            ],
            easeFactor: 0.25
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.1
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 0
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0,0]
                },
                {
                    uniform: 'uRotation', 
                    value: 90
                },
                {
                    uniform: 'uSpeed', 
                    value: 2
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.3},
                {prop: 'uSineDistortCycleCount', from: 0, to: 1.5},
            ],
            easeFactor: 0.35
        },
        {
            type: 'RollingDistortMaterial',
            uniforms: [
                {
                    uniform: 'uSineDistortSpread', 
                    value: 0.28
                },
                {
                    uniform: 'uSineDistortCycleCount', 
                    value: 7
                },
                {
                    uniform: 'uSineDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortVolatility', 
                    value: 0
                },
                {
                    uniform: 'uNoiseDistortAmplitude', 
                    value: 0
                },
                {
                    uniform: 'uDistortPosition', 
                    value: [0,0]
                },
                {
                    uniform: 'uRotation', 
                    value: 90
                },
                {
                    uniform: 'uSpeed', 
                    value: 0.3
                }
            ],
            animatable: [
                {prop: 'uSineDistortAmplitude', from: 0, to: 0.2}
            ],
            easeFactor: 0.65
        }
    ];

    // Preload fonts.
    WebFont.load({
        google: {families: ['Goblin+One']},
        active: () => [...document.querySelectorAll('[data-blotter]')].forEach((el, pos) => new BlotterEl(el, config[pos]))
    });

    // Preload all the images in the page.
    imagesLoaded(document.querySelectorAll('.grid__item-img'), {background: true}, () => document.body.classList.remove('loading'));
}