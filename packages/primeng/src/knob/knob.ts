import { CommonModule } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, EventEmitter, forwardRef, inject, Input, NgModule, numberAttribute, Output, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { $dt } from '@primeuix/styled';
import { SharedModule } from 'primeng/api';
import { VoidListener } from 'primeng/ts-helpers';
import { KnobStyle } from './style/knobstyle';
import { BaseInput } from 'primeng/baseinput';
import { BaseEditableHolder } from 'primeng/baseeditableholder';

export const KNOB_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Knob),
    multi: true
};
/**
 * Knob is a form component to define number inputs with a dial.
 * @group Components
 */
@Component({
    selector: 'p-knob',
    standalone: true,
    imports: [CommonModule, SharedModule],
    template: `
        <svg
            viewBox="0 0 100 100"
            role="slider"
            [style.width]="size + 'px'"
            [style.height]="size + 'px'"
            (click)="onClick($event)"
            (keydown)="onKeyDown($event)"
            (mousedown)="onMouseDown($event)"
            (mouseup)="onMouseUp($event)"
            (touchstart)="onTouchStart($event)"
            (touchend)="onTouchEnd($event)"
            [attr.aria-valuemin]="min"
            [attr.aria-valuemax]="max"
            [attr.required]="required()"
            [attr.aria-valuenow]="_value"
            [attr.aria-labelledby]="ariaLabelledBy"
            [attr.aria-label]="ariaLabel"
            [attr.tabindex]="readonly || disabled() ? -1 : tabindex"
            [attr.data-pc-section]="'svg'"
        >
            <path [attr.d]="rangePath()" [attr.stroke-width]="strokeWidth" [attr.stroke]="rangeColor" [class]="cx('range')"></path>
            <path [attr.d]="valuePath()" [attr.stroke-width]="strokeWidth" [attr.stroke]="valueColor" [class]="cx('value')"></path>
            <text *ngIf="showValue" [attr.x]="50" [attr.y]="57" text-anchor="middle" [attr.fill]="textColor" [class]="cx('text')" [attr.name]="name()">
                {{ valueToDisplay() }}
            </text>
        </svg>
    `,
    providers: [KNOB_VALUE_ACCESSOR, KnobStyle],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.data-pc-name]': "'knob'",
        '[attr.data-pc-section]': "'root'",
        '[class]': "cn(cx('root'), styleClass)",
        '[attr.disabled]': 'disabled()',
        '[attr.name]': 'name()',
        '[attr.min]': 'min',
        '[attr.required]': 'required()',
        '[attr.step]': 'step'
    }
})
export class Knob extends BaseEditableHolder {
    /**
     * Style class of the component.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Defines a string that labels the input for accessibility.
     * @group Props
     */
    @Input() ariaLabel: string | undefined;
    /**
     * Specifies one or more IDs in the DOM that labels the input field.
     * @group Props
     */
    @Input() ariaLabelledBy: string | undefined;
    /**
     * Index of the element in tabbing order.
     * @group Props
     */
    @Input({ transform: numberAttribute }) tabindex: number = 0;
    /**
     * Background of the value.
     * @group Props
     */
    @Input() valueColor: string = $dt('knob.value.background').variable;
    /**
     * Background color of the range.
     * @group Props
     */
    @Input() rangeColor: string = $dt('knob.range.background').variable;
    /**
     * Color of the value text.
     * @group Props
     */
    @Input() textColor: string = $dt('knob.text.color').variable;
    /**
     * Template string of the value.
     * @group Props
     */
    @Input() valueTemplate: string = '{value}';
    /**
     * Size of the component in pixels.
     * @group Props
     */
    @Input({ transform: numberAttribute }) size: number = 100;
    /**
     * Mininum boundary value.
     * @group Props
     */
    @Input({ transform: numberAttribute }) min: number = 0;
    /**
     * Maximum boundary value.
     * @group Props
     */
    @Input({ transform: numberAttribute }) max: number = 100;
    /**
     * Step factor to increment/decrement the value.
     * @group Props
     */
    @Input({ transform: numberAttribute }) step: number = 1;
    /**
     * Width of the knob stroke.
     * @group Props
     */
    @Input({ transform: numberAttribute }) strokeWidth: number = 14;
    /**
     * Whether the show the value inside the knob.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) showValue: boolean = true;
    /**
     * When present, it specifies that the component value cannot be edited.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) readonly: boolean = false;
    /**
     * Callback to invoke on value change.
     * @param {number} value - New value.
     * @group Emits
     */
    @Output() onChange: EventEmitter<number> = new EventEmitter<number>();

    radius: number = 40;

    midX: number = 50;

    midY: number = 50;

    minRadians: number = (4 * Math.PI) / 3;

    maxRadians: number = -Math.PI / 3;

    value: number = 0;

    windowMouseMoveListener: VoidListener;

    windowMouseUpListener: VoidListener;

    windowTouchMoveListener: VoidListener;

    windowTouchEndListener: VoidListener;

    onModelChange: Function = () => {};

    onModelTouched: Function = () => {};

    _componentStyle = inject(KnobStyle);

    mapRange(x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
        return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    onClick(event: MouseEvent) {
        if (!this.disabled() && !this.readonly) {
            this.updateValue(event.offsetX, event.offsetY);
        }
    }

    updateValue(offsetX: number, offsetY: number) {
        let dx = offsetX - this.size / 2;
        let dy = this.size / 2 - offsetY;
        let angle = Math.atan2(dy, dx);
        let start = -Math.PI / 2 - Math.PI / 6;
        this.updateModel(angle, start);
    }

    updateModel(angle: number, start: number) {
        let mappedValue;
        if (angle > this.maxRadians) mappedValue = this.mapRange(angle, this.minRadians, this.maxRadians, this.min, this.max);
        else if (angle < start) mappedValue = this.mapRange(angle + 2 * Math.PI, this.minRadians, this.maxRadians, this.min, this.max);
        else return;

        let newValue = Math.round((mappedValue - this.min) / this.step) * this.step + this.min;
        this.value = newValue;
        this.writeModelValue(this.value);
        this.onModelChange(this.value);
        this.onChange.emit(this.value);
    }

    onMouseDown(event: MouseEvent) {
        if (!this.disabled() && !this.readonly) {
            const window = this.document.defaultView || 'window';
            this.windowMouseMoveListener = this.renderer.listen(window, 'mousemove', this.onMouseMove.bind(this));
            this.windowMouseUpListener = this.renderer.listen(window, 'mouseup', this.onMouseUp.bind(this));
            event.preventDefault();
        }
    }

    onMouseUp(event: MouseEvent) {
        if (!this.disabled() && !this.readonly) {
            if (this.windowMouseMoveListener) {
                this.windowMouseMoveListener();
                this.windowMouseUpListener = null;
            }

            if (this.windowMouseUpListener) {
                this.windowMouseUpListener();
                this.windowMouseMoveListener = null;
            }
            event.preventDefault();
        }
    }

    onTouchStart(event: TouchEvent) {
        if (!this.disabled() && !this.readonly) {
            const window = this.document.defaultView || 'window';
            this.windowTouchMoveListener = this.renderer.listen(window, 'touchmove', this.onTouchMove.bind(this));
            this.windowTouchEndListener = this.renderer.listen(window, 'touchend', this.onTouchEnd.bind(this));
            event.preventDefault();
        }
    }

    onTouchEnd(event: TouchEvent) {
        if (!this.disabled() && !this.readonly) {
            if (this.windowTouchMoveListener) {
                this.windowTouchMoveListener();
            }
            if (this.windowTouchEndListener) {
                this.windowTouchEndListener();
            }
            this.windowTouchMoveListener = null;
            this.windowTouchEndListener = null;
            event.preventDefault();
        }
    }

    onMouseMove(event: MouseEvent) {
        if (!this.disabled() && !this.readonly) {
            this.updateValue(event.offsetX, event.offsetY);
            event.preventDefault();
        }
    }

    onTouchMove(event: Event) {
        if (!this.disabled() && !this.readonly && event instanceof TouchEvent && event.touches.length === 1) {
            const rect = this.el.nativeElement.children[0].getBoundingClientRect();
            const touch = event.targetTouches.item(0);
            if (touch) {
                const offsetX = touch.clientX - rect.left;
                const offsetY = touch.clientY - rect.top;
                this.updateValue(offsetX, offsetY);
            }
        }
    }

    updateModelValue(newValue) {
        if (newValue > this.max) this.value = this.max;
        else if (newValue < this.min) this.value = this.min;
        else this.value = newValue;

        this.writeModelValue(this.value);
        this.onModelChange(this.value);
        this.onChange.emit(this.value);
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.disabled() && !this.readonly) {
            switch (event.code) {
                case 'ArrowRight':

                case 'ArrowUp': {
                    event.preventDefault();
                    this.updateModelValue(this._value + 1);
                    break;
                }

                case 'ArrowLeft':

                case 'ArrowDown': {
                    event.preventDefault();
                    this.updateModelValue(this._value - 1);
                    break;
                }

                case 'Home': {
                    event.preventDefault();
                    this.updateModelValue(this.min);

                    break;
                }

                case 'End': {
                    event.preventDefault();
                    this.updateModelValue(this.max);
                    break;
                }

                case 'PageUp': {
                    event.preventDefault();
                    this.updateModelValue(this._value + 10);
                    break;
                }

                case 'PageDown': {
                    event.preventDefault();
                    this.updateModelValue(this._value - 10);
                    break;
                }
            }
        }
    }

    writeValue(value: any): void {
        this.value = value;
        this.writeModelValue(this.value);
        this.cd.markForCheck();
    }

    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    rangePath() {
        return `M ${this.minX()} ${this.minY()} A ${this.radius} ${this.radius} 0 1 1 ${this.maxX()} ${this.maxY()}`;
    }

    valuePath() {
        return `M ${this.zeroX()} ${this.zeroY()} A ${this.radius} ${this.radius} 0 ${this.largeArc()} ${this.sweep()} ${this.valueX()} ${this.valueY()}`;
    }

    zeroRadians() {
        if (this.min > 0 && this.max > 0) return this.mapRange(this.min, this.min, this.max, this.minRadians, this.maxRadians);
        else return this.mapRange(0, this.min, this.max, this.minRadians, this.maxRadians);
    }

    valueRadians() {
        return this.mapRange(this._value, this.min, this.max, this.minRadians, this.maxRadians);
    }

    minX() {
        return this.midX + Math.cos(this.minRadians) * this.radius;
    }

    minY() {
        return this.midY - Math.sin(this.minRadians) * this.radius;
    }

    maxX() {
        return this.midX + Math.cos(this.maxRadians) * this.radius;
    }

    maxY() {
        return this.midY - Math.sin(this.maxRadians) * this.radius;
    }

    zeroX() {
        return this.midX + Math.cos(this.zeroRadians()) * this.radius;
    }

    zeroY() {
        return this.midY - Math.sin(this.zeroRadians()) * this.radius;
    }

    valueX() {
        return this.midX + Math.cos(this.valueRadians()) * this.radius;
    }

    valueY() {
        return this.midY - Math.sin(this.valueRadians()) * this.radius;
    }

    largeArc() {
        return Math.abs(this.zeroRadians() - this.valueRadians()) < Math.PI ? 0 : 1;
    }

    sweep() {
        return this.valueRadians() > this.zeroRadians() ? 0 : 1;
    }

    valueToDisplay() {
        return this.valueTemplate.replace('{value}', this._value.toString());
    }

    get _value(): number {
        return this.value != null ? this.value : this.min;
    }
}

@NgModule({
    imports: [Knob, SharedModule],
    exports: [Knob, SharedModule]
})
export class KnobModule {}
