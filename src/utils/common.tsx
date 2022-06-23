export const reduceDIDstring = (strDID) => {
  if(!strDID)
    return ''

  if((strDID.match(/:/g) || []).length !== 2){
    if(strDID.length<10)
      return strDID
    return `${strDID.substring(0, 6)}...${strDID.substring(strDID.length - 3, strDID.length)}`;
  }

  const prefix = strDID.split(':', 2).join(':');
  if (prefix.length >= strDID.length)
    return strDID;
  const tempDID = strDID.substring(prefix.length + 1);
  if(tempDID.length<10)
    return strDID
  return prefix+`:${tempDID.substring(0, 6)}...${tempDID.substring(tempDID.length - 3, tempDID.length)}`;
}