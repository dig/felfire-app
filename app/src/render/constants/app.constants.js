import EmailVerification from '../ui/page/EmailVerification';
import ForgotPassword from '../ui/page/ForgotPassword';
import Library from '../ui/page/Library';
import Login from '../ui/page/Login';
import Register from '../ui/page/Register';

import Load from '../ui/overlay/Load';
import Changelog from '../ui/overlay/Changelog';
import Picture from '../ui/overlay/Picture';
import Capture from '../ui/overlay/Capture';
import Monitor from '../ui/overlay/Monitor';
import Window from '../ui/overlay/Window';

import Region from '../ui/capture/region/Region';
import Video from '../ui/capture/video/Video';

const PAGES = {
  LOGIN: Login,
  REGISTER: Register,
  FORGOTPASSWORD: ForgotPassword,
  EMAILVERIFICATION: EmailVerification,
  LIBRARY: Library
};

const OVERLAY = {
  LOAD: Load,
  CHANGELOG: Changelog,
  PICTURE: Picture,
  CAPTURE: Capture,
  MONITOR: Monitor,
  WINDOW: Window
};

const CAPTURE = {
  REGION: Region,
  VIDEO: Video
};

export {
  PAGES,
  OVERLAY,
  CAPTURE
};