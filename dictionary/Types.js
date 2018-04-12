'use strict';module.exports=Object.freeze({":type:data:num":{"base":"kTypeDataNum","format":["number"],"cast":"castNumber","tree":[":type:data:num"]},":type:data:int":{"base":"kTypeDataNum","format":["number","integer"],"cast":"castNumber","tree":[":type:data:num",":type:data:int"]},":type:data:dec":{"base":"kTypeDataNum","format":["number"],"cast":"castNumber","tree":[":type:data:num",":type:data:dec"]},":type:data:stamp":{"base":"kTypeDataNum","format":["date","timestamp"],"cast":"castNumber","tree":[":type:data:num",":type:data:stamp"]},":type:data:txt":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:txt"]},":type:data:hex":{"base":"kTypeDataTxt","format":["string","hex"],"cast":"castHexadecimal","tree":[":type:data:txt",":type:data:hex"],"regx":["/^[a-f0-9]+$/"]},":type:data:url":{"base":"kTypeDataTxt","format":["string","uri"],"cast":"castString","tree":[":type:data:txt",":type:data:url"]},":type:data:xml":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:txt",":type:data:xml"]},":type:data:svg":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:txt",":type:data:xml",":type:data:svg"]},":type:data:html":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:txt",":type:data:xml",":type:data:html"]},":type:data:array":{"base":"kTypeDataArray","format":["array"],"tree":[":type:data:array"]},":type:data:range":{"base":"kTypeDataArray","format":["array"],"tree":[":type:data:array",":type:data:range"],"size":[4,4,true,true],"children":[{"base":"kTypeDataInt","format":["number","integer"],"tree":[":type:data:int"],"must":true},{"base":"kTypeDataInt","format":["number","integer"],"tree":[":type:data:int"],"must":true},{"base":"kTypeDataBool","format":["boolean"],"tree":[":type:data:bool"],"must":true},{"base":"kTypeDataBool","format":["boolean"],"tree":[":type:data:bool"],"must":true}]},":type:data:struct":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct"]},":type:data:map":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:map"],"validate":"validateMappedStruct"},":type:data:map:txt":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:map",":type:data:map:txt"],"validate":"validateMappedStruct","children":{"base":"kTypeDataTxt","format":["string"],"tree":[":type:data:txt"],"cast":"castString"}},":type:data:map:str":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:map",":type:data:map:txt",":type:data:map:str"],"validate":"validateMappedStruct","children":{"base":"kTypeDataTxt","format":["string"],"tree":[":type:data:txt"],"cast":"castString","size":[1,254,true,true]}},":type:data:map:str:set":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:map",":type:data:map:txt",":type:data:map:str",":type:data:map:str:set"],"validate":"validateMappedStruct","children":{"base":"kTypeDataArray","format":["array"],"tree":[":type:data:array"],"set":true,"children":{"base":"kTypeDataTxt","format":["string"],"tree":[":type:data:txt"],"cast":"castString","size":[1,254,true,true]}}},":type:data:map:html":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:map",":type:data:map:html"],"validate":"validateMappedStruct","children":{"base":"kTypeDataTxt","format":["string"],"tree":[":type:data:txt"],"cast":"castString"}},":type:data:map:struct":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:map",":type:data:map:struct"],"validate":"validateMappedStruct","children":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct"]}},":type:data:geojson":{"base":"kTypeDataStruct","format":["object"],"tree":[":type:data:struct",":type:data:geojson"],"validate":"validateGeoJsonStruct"},":type:data:any":{"base":"kTypeDataAny","format":["any"],"tree":[":type:data:any"]},":type:data:bool":{"base":"kTypeDataBool","format":["boolean"],"cast":"castBoolean","tree":[":type:data:bool"]},":type:data:str":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str"],"size":[1,254,true,true]},":type:data:key":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:key"],"size":[1,254,true,true],"regx":["/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/"]},":type:data:var":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:var"],"size":[1,128,true,true],"regx":["/^[a-zA-Z0-9_]+$/"]},":type:data:email":{"base":"kTypeDataTxt","format":["string","email"],"cast":"castString","tree":[":type:data:str",":type:data:email"],"size":[1,254,true,true]},":type:data:ref":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:ref"],"size":[1,254,true,true],"validate":"validateIdReference"},":type:data:field":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:ref",":type:data:field"],"size":[1,254,true,true],"validate":"validateFieldReference","regx":["/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/"]},":type:data:term":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:ref",":type:data:term"],"size":[1,254,true,true],"validate":"validateKeyReference","regx":["/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/"],"coll":"terms"},":type:data:term:enum":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:ref",":type:data:term",":type:data:term:enum"],"size":[1,254,true,true],"validate":"validateKeyReference","regx":["/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/","/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/"],"coll":"terms","inst":"terms/:instance:enumeration"},":type:data:field:enum":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:ref",":type:data:term",":type:data:field:enum"],"size":[1,254,true,true],"validate":"validateEnumReference","regx":["/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/","/^[a-zA-Z0-9_\\-+=$:;,.@()!*’%\\\\]+$/"],"coll":"terms","inst":"terms/:instance:enumeration"},":type:data:date":{"base":"kTypeDataTxt","format":["string"],"cast":"castString","tree":[":type:data:str",":type:data:date"],"size":[1,254,true,true],"regx":["/(^\\d{4}$)|(^\\d{6}$)|(^\\d{8}$)|(^\\d{4}\\/\\d*$)|(^\\d{4}\\-\\d*$)|(^\\d{4}\\/\\d*\\/\\d*$)|(^\\d{4}\\-\\d*\\-\\d*$)/"],"validate":"validateDate"}});