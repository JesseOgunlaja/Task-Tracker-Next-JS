import { globalJWT } from "./middlewares/globalJWT";
import { stackMiddlewares } from "./middlewares/stackMiddlewares";

export default stackMiddlewares([globalJWT]);