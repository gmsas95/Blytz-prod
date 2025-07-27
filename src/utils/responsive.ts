import {Dimensions} from 'react-native';

// Guideline sizes are based on standard phone screen dimensions
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const scale = (size: number) => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = (size: number) =>
  (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export {
  scale as responsiveWidth,
  verticalScale as responsiveHeight,
  moderateScale as responsiveFontSize,
};
