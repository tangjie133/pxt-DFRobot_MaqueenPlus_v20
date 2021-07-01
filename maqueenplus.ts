
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
//% weight=100 color=#0fbc11 icon="" block="Maqueen Plus V2.0"
namespace custom {
    

    /**
     * TODO: 电机控制模块
     * @param emotor 电机选择枚举
     * @param edir   电机方向选择枚举
     * @param speed  电机速度控制 eg:100
     * @return 无
     */
    //% block="set %emotor direction %edir speed %speed"
    //% speed.min=0 speed.max=255
    //% weight=98
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
     * TODO: 获取巡线传感器AD数据
     * @param eline 选择巡线传感器枚举
     * @return 返回选择巡线传感器AD值
     */
    //% block="read line sensor %eline data"
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
     * @param trig trig引脚选择枚举 eg:DigitalPin.P14
     * @param echo echo引脚选择枚举 eg:DigitalPin.P15
     * @return 返回超声波获取的数据
     */
    //% block="read ultrasonic sensor TRIG %trig ECHO %echo company:cm"
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
    //% weight=93
    export function readVersion():string{
        let version;
        pins.i2cWriteNumber(I2CADDR, VERSION_CNT_REGISTER, NumberFormat.Int8LE);
        version = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        pins.i2cWriteNumber(I2CADDR, VERSION_DATA_REGISTER, NumberFormat.Int8LE);
         version= pins.i2cReadBuffer(I2CADDR, version);
        let versionString = version.toString();
        return versionString
    }
}