import{Text,View,StyleSheet}from'react-native';
export function SimpleScreen({title,description}:{title:string;description:string}){return <View style={styles.page}><Text style={styles.title}>{title}</Text><Text style={styles.text}>{description}</Text></View>}
const styles=StyleSheet.create({page:{flex:1,padding:18,backgroundColor:'#f6f7f8'},title:{fontSize:34,fontWeight:'900'},text:{marginTop:12,color:'#64748b',fontSize:16}});
