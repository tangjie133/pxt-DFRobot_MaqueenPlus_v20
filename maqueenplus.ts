
//电机选择枚举
enum MyEnumMotor{
    //% block="left motor"
    eLeftMotor,
    //% block="right motor"
    eRightMotor,
    //% block="all motor"
    eAllMotor,
};

//电机方向枚举选择
enum MyEnumDir{
    //% block="rotate forward"
    eForward,
    //% block="backward"
    eBackward,
};

//LED灯选择枚举
enum MyEnumLed{
    //% block="left led light"
    eLeftLed,
    //% block="right led light"
    eRightLed,
    //% block="all led light"
    eAllLed,
};

//LED灯开关枚举选择
enum MyEnumSwitch{
    //% block="close"
    eClose,
    //% block="open"
    eOpen,
};

//巡线传感器选择
enum MyEnumLineSensor{
    //% block="L1"
    eL1,
    //% block="M"
    eM,
    //% block="R1"
    eR1,
    //% block="L2"
    eL2,
    //% block="R2"
    eR2,
};

const I2CADDR = 0x10;
const ADC0_REGISTER = 0X1E;
const ADC1_REGISTER = 0X20;
const ADC2_REGISTER = 0X22;
const ADC3_REGISTER = 0X24;
const ADC4_REGISTER = 0X26;
const LEFT_LED_REGISTER = 0X0B;
const RIGHT_LED_REGISTER = 0X0C;
const LEFT_MOTOR_REGISTER = 0X00;
const RIGHT_MOTOR_REGISTER = 0X02;
const LINE_STATE_REGISTER = 0X1D;
const VERSION_CNT_REGISTER = 0X32;
const VERSION_DATA_REGISTER = 0X33;

/**
 * 自定义图形块
 */
//% weight=100 color=#0fbc11 icon="\uf067" block="Maqueen Plus V2"
namespace DFRobotMaqueenPlusV2 {
    
    let irstate: number;
    let state: number;
    let maqueencb: Action
    let maqueenmycb: Action
    let maqueene = "1"
    let maqueenparam = 0
    let alreadyInit = 0
    let IrPressEvent = 0
    export class Packeta {
        public mye: string;
        public myparam: number;
    }
    /**
     * TODO: 电机控制模块
     * @param emotor 电机选择枚举
     * @param edir   电机方向选择枚举
     * @param speed  电机速度控制 eg:100
     * @return 无
     */
    //% block="set %emotor direction %edir speed %speed"
    //% speed.min=0 speed.max=255
    //% weight=99
    export function controlMotor(emotor:MyEnumMotor, edir:MyEnumDir, speed:number):void{
        switch(emotor){
            case MyEnumMotor.eLeftMotor:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = edir;
                leftBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
            break;
            case MyEnumMotor.eRightMotor:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = edir;
                rightBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
            break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = edir;
                allBuffer[2] = speed;
                allBuffer[3] = edir;
                allBuffer[4] = speed;
                pins.i2cWriteBuffer(I2CADDR, allBuffer)
            break;   
        }
    }
    //% block="set %emotor stop"
    //% weight=98
    export function controlMotorStop(emotor:MyEnumMotor):void{
        switch (emotor) {
            case MyEnumMotor.eLeftMotor:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = 0;
                leftBuffer[2] = 0;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
                break;
            case MyEnumMotor.eRightMotor:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = 0;
                rightBuffer[2] = 0;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
                break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = 0;
                allBuffer[2] = 0;
                allBuffer[3] = 0;
                allBuffer[4] = 0;
                pins.i2cWriteBuffer(I2CADDR, allBuffer)
                break;
        }
    }

    /**
     * TODO: 控制左右LED灯开关模块
     * @param eled LED灯选择
     * @param eswitch 控制LED灯的打开或关闭
     * @return  无
     */
    //% block="control %eled %eSwitch"
    //% weight=97
    export function controlLED(eled:MyEnumLed, eSwitch:MyEnumSwitch):void{
        switch(eled){
            case MyEnumLed.eLeftLed:
                let leftLedControlBuffer = pins.createBuffer(2);
                leftLedControlBuffer[0] = LEFT_LED_REGISTER;
                leftLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, leftLedControlBuffer);
            break;
            case MyEnumLed.eRightLed:
                let rightLedControlBuffer = pins.createBuffer(2);
                rightLedControlBuffer[0] = RIGHT_LED_REGISTER;
                rightLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, rightLedControlBuffer);
            break;
            default:
                let allLedControlBuffer = pins.createBuffer(3);
                allLedControlBuffer[0] = LEFT_LED_REGISTER;
                allLedControlBuffer[1] = eSwitch;
                allLedControlBuffer[2] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, allLedControlBuffer);
            break;
        }
    }

    /**
     * TODO: 获取巡线传感器状态
     * @param eline  选择巡线传感器枚举
     * @return 返回选择巡线传感器状态
     */
    //% block="read line sensor %eline state"
    //% weight=96
    export function readLineSensorState(eline:MyEnumLineSensor):number{
        pins.i2cWriteNumber(I2CADDR, LINE_STATE_REGISTER, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE)
        let state;
        switch(eline){
            case MyEnumLineSensor.eL1: 
                state = (data & 0x08) == 0x08 ? 1 : 0; 
            break;
            case MyEnumLineSensor.eM: 
                state = (data & 0x04) == 0x04 ? 1 : 0; 
            break;
            case MyEnumLineSensor.eR1: 
                state = (data & 0x02) == 0x02 ? 1 : 0; 
            break;
            case MyEnumLineSensor.eL2: 
                state = (data & 0x10) == 0X10 ? 1 : 0; 
            break;
            default:
                state = (data & 0x01) == 0x01 ? 1 : 0;
            break;
        }
        return state;
    }
    
    /**
     * TODO: 获取巡线传感器ADC数据
     * @param eline 选择巡线传感器枚举
     * @return 返回选择巡线传感器AD值
     */
    //% block="read line sensor %eline  ADC data"
    //% weight=95
    export function readLineSensorData(eline:MyEnumLineSensor):number{
        let data;
        switch(eline){
            case MyEnumLineSensor.eR2:
                pins.i2cWriteNumber(I2CADDR, ADC0_REGISTER, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(I2CADDR, 1);
                data = adc0Buffer[1] << 8 | adc0Buffer[0]
            break;
            case MyEnumLineSensor.eR1:
                pins.i2cWriteNumber(I2CADDR, ADC1_REGISTER, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc1Buffer[1] << 8 | adc1Buffer[0];
            break;
            case MyEnumLineSensor.eM:
                pins.i2cWriteNumber(I2CADDR, ADC2_REGISTER, NumberFormat.Int8LE);
                let adc2Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc2Buffer[1] << 8 | adc2Buffer[0];
            break;
            case MyEnumLineSensor.eL1:
                pins.i2cWriteNumber(I2CADDR, ADC3_REGISTER, NumberFormat.Int8LE);
                let adc3Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc3Buffer[1] << 1 | adc3Buffer[0];
            break;
            default:
                pins.i2cWriteNumber(I2CADDR, ADC4_REGISTER, NumberFormat.Int8LE);
                let adc4Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc4Buffer[1] << 8 | adc4Buffer[0];
            break;

        }
        return data;
    }
    /**
     * DOTO:获取超声波数据
     * @param trig trig引脚选择枚举 eg:DigitalPin.P13
     * @param echo echo引脚选择枚举 eg:DigitalPin.P14
     * @return 返回超声波获取的数据
     */
    //% block="set ultrasonic sensor TRIG pin %trig ECHO pin %echo read data company:cm"
    //% weight=94
    export function readUltrasonic(trig:DigitalPin, echo:DigitalPin):number{
        let data;
        pins.digitalWritePin(trig, 1);
        basic.pause(1);
        pins.digitalWritePin(trig, 0)
        if(pins.digitalReadPin(echo) == 0){
            pins.digitalWritePin(trig, 1);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High,500*58);
        }else{
            pins.digitalWritePin(trig, 0);
            pins.digitalWritePin(trig, 1);
            data = pins.pulseIn(echo, PulseValue.High,500*58)
        }
        data = data/39;
        if(data <= 0 || data > 500)
            return 0;
        return Math.round(data);
    }

    /**
     * DOTO: 获取版本号
     * @param 无
     * @return 返回版本号
     */
    //% block="read version"
    //% weight=2
    export function readVersion():string{
        let version;
        pins.i2cWriteNumber(I2CADDR, VERSION_CNT_REGISTER, NumberFormat.Int8LE);
        version = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        pins.i2cWriteNumber(I2CADDR, VERSION_DATA_REGISTER, NumberFormat.Int8LE);
         version= pins.i2cReadBuffer(I2CADDR, version);
        let versionString = version.toString();
        return versionString
    }
    /**
    * Read IR sensor value V2.
    */

    //% advanced=true shim=maqueenIRV2::irCode
    function irCode(): number {
        return 0;
    }

    //% weight=93
    // group="micro:bit(v2)"
    //% block="read IR key value"
    export function IR_readV2(): number {
        return valuotokeyConversion();
    }

    //% weight=92
    // group="micro:bit(v2)"
    //% block="on IR received"
    //% draggableParameters
    export function IR_callbackUserV2(cb: (message: number) => void) {
        state = 1;
        control.onEvent(11, 22, function () {
            cb(irstate)
        })
    }
    function valuotokeyConversion(): number {
        let irdata: number;
        switch (irCode()) {
            case 0xff00: irdata = 0; break;
            case 0xfe01: irdata = 1; break;
            case 0xfd02: irdata = 2; break;
            case 0xfb04: irdata = 4; break;
            case 0xfa05: irdata = 5; break;
            case 0xf906: irdata = 6; break;
            case 0xf708: irdata = 8; break;
            case 0xf609: irdata = 9; break;
            case 0xf50a: irdata = 10; break;
            case 0xf30c: irdata = 12; break;
            case 0xf20d: irdata = 13; break;
            case 0xf10e: irdata = 14; break;
            case 0xef10: irdata = 16; break;
            case 0xee11: irdata = 17; break;
            case 0xed12: irdata = 18; break;
            case 0xeb14: irdata = 20; break;
            case 0xea15: irdata = 21; break;
            case 0xe916: irdata = 22; break;
            case 0xe718: irdata = 24; break;
            case 0xe619: irdata = 25; break;
            case 0xe51a: irdata = 20; break;
            default:
                irdata = -1;
        }
        return irdata;
    }

    basic.forever(() => {
        if (state == 1) {
            irstate = valuotokeyConversion();
            if (irstate != -1) {
                control.raiseEvent(11, 22)
            }
        }

        basic.pause(50);
    })

    /** 
    * Set the three primary color:red, green, and blue
    * @param r  , eg: 100
    * @param g  , eg: 100
    * @param b  , eg: 100
    */

    //% weight=
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% block="red|%r green|%g blue|%b"
    export function microIoT_rgb(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    /**
     * RGB LEDs light up from A to B
     * @param from  , eg: 1
     * @param to  , eg: 4
     */

    //% weight=60
    //% from.min=1 from.max=4
    //% to.min=1 to.max=4
    //% block="range from |%from with|%to leds"
    export function microIoT_ledRange(from: number, to: number): number {
        return ((from - 1) << 16) + (2 << 8) + (to);
    }

    /**
     * Set the color of the specified LEDs
     * @param index  , eg: 1
     */

    //% weight=60
    //% index.min=1 index.max=4
    //% rgb.shadow="colorNumberPicker"
    //% block="RGB light |%index show color|%rgb"
    export function microIoT_setIndexColor(index: number, rgb: number) {
        let f = index - 1;
        let t = index - 1;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if ((index - 1) > 15) {
            if ((((index - 1) >> 8) & 0xFF) == 0x02) {
                f = (index - 1) >> 16;
                t = (index - 1) & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)

    }

    /**
     * Set the color of all RGB LEDs
     */

    //% weight=60
    //% rgb.shadow="colorNumberPicker"
    //% block=" RGB show color |%rgb"
    export function microIoT_showColor(rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 16 * 3; i++) {
            if ((i % 3) == 0)
                neopixel_buf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixel_buf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixel_buf[i] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    /**
     * Set the brightness of RGB LED
     * @param brightness  , eg: 100
     */

    //% weight=70
    //% brightness.min=0 brightness.max=255
    //% block="set RGB brightness to |%brightness"
    export function microIoT_setBrightness(brightness: number) {
        _brightness = brightness;
    }

    /**
     * Turn off all RGB LEDs
     */

    //% weight=40
    //% group="RGB"
    //% block="clear all RGB"
    export function microIoT_ledBlank() {
        microIoT_showColor(0)
    }

    /**
     * RGB LEDs display rainbow colors 
     */

    //% weight=50
    //% startHue.defl=1
    //% endHue.defl=360
    //% startHue.min=0 startHue.max=360
    //% endHue.min=0 endHue.max=360
    //% blockId=led_rainbow block="set RGB show rainbow color from|%startHue to|%endHue"
    export function ledRainbow(startHue: number, endHue: number) {
        startHue = startHue >> 0;
        endHue = endHue >> 0;
        const saturation = 100;
        const luminance = 50;
        let steps = 3 + 1;
        const direction = HueInterpolationDirection.Clockwise;

        //hue
        const h1 = startHue;
        const h2 = endHue;
        const hDistCW = ((h2 + 360) - h1) % 360;
        const hStepCW = Math.idiv((hDistCW * 100), steps);
        const hDistCCW = ((h1 + 360) - h2) % 360;
        const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
        let hStep: number;
        if (direction === HueInterpolationDirection.Clockwise) {
            hStep = hStepCW;
        } else if (direction === HueInterpolationDirection.CounterClockwise) {
            hStep = hStepCCW;
        } else {
            hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
        }
        const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

        //sat
        const s1 = saturation;
        const s2 = saturation;
        const sDist = s2 - s1;
        const sStep = Math.idiv(sDist, steps);
        const s1_100 = s1 * 100;

        //lum
        const l1 = luminance;
        const l2 = luminance;
        const lDist = l2 - l1;
        const lStep = Math.idiv(lDist, steps);
        const l1_100 = l1 * 100

        //interpolate
        if (steps === 1) {
            writeBuff(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
        } else {
            writeBuff(0, hsl(startHue, saturation, luminance));
            for (let i = 1; i < steps - 1; i++) {
                const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                const s = Math.idiv((s1_100 + i * sStep), 100);
                const l = Math.idiv((l1_100 + i * lStep), 100);
                writeBuff(0 + i, hsl(h, s, l));
            }
            writeBuff(3, hsl(endHue, saturation, luminance));
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P15)
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    function writeBuff(index: number, rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        neopixel_buf[index * 3 + 0] = Math.round(g)
        neopixel_buf[index * 3 + 1] = Math.round(r)
        neopixel_buf[index * 3 + 2] = Math.round(b)
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return (r << 16) + (g << 8) + b;
    }

}