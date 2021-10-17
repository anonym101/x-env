
/**
 * Get projects root .env file
 * @param pth optional if not supplied will lookup projects root .env
 */
//  export const pathToBaseRootEnv=(pth=''):string=>{
//     pth = pth || path.resolve(process.cwd(), '.env');
//     return path.isAbsolute(pth) ? pth : path.resolve(process.cwd(), pth);
// }

console.log(process.cwd(), process.argv)