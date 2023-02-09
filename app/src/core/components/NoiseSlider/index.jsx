import { withStyles } from "@material-ui/core/styles";
import Slider from "@material-ui/core/Slider";

const NoiseSlider = withStyles({
    root : {
        color   : "#3880ff",
        height  : 2,
        padding : "15px 0",
    },
    track : {
        height : 2,
    },
    rail : {
        height  : 2,
        opacity : 0.2,
    },
    mark : {
        backgroundColor : "#bfbfbf",
        height          : 10,
        width           : 3,
        marginTop       : -3,
    },
    markActive : {
        opacity         : 1,
        backgroundColor : "currentColor",
    },
})(Slider);

export default NoiseSlider;
