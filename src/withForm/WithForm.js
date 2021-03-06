import React from 'react';
import { validateControl,isObject,bindControlToRule } from './../utils/utils';
const withForm = function(Wrappedcomp,controls, formpropname="form"){
    if(!isObject(controls) || Object.keys(controls).length <= 0){
        throw new Error('you need to provide controls in secocde parameter');
    }
    return class WithFormComponent extends React.Component{
        constructor(props){
            super(props);
            this.state = {
                values:{},
                errors:{},
                rules:{},
                dirtys:{}
            }

            Object.keys(controls).map((name) =>{
                this.state.rules[name] = controls[name][1] ? controls[name][1] : [];
                this.state.dirtys[name] = false;
                if(props.prefill && props.prefill[name]){
                    this.state.values[name] = props.prefill[name];
                }else{
                    this.state.values[name] = controls[name][0];
                }
                
                const bindrules = bindControlToRule(this.state.rules[name],this.state.values);

                this.state.errors[name] = validateControl(this.state.values[name],bindrules,name);
            });
        }

        updateValue(name,value,setDirty){
            const newValues = {
                ...this.state.values,
                [name]:value
            };
            const newDirtys = {
                ...this.state.dirtys,
                [name]:setDirty
            }
            let newErrors = {};
            Object.keys(controls).map((name) => {
                const bindrules = bindControlToRule(this.state.rules[name],newValues);
                newErrors[name] = validateControl(newValues[name],bindrules,name);
            });
        
            this.setState(()=>{
                return {
                    errors:newErrors,
                    values:newValues,
                    dirtys:newDirtys
                }
            });
            
        }
        

        render(){
            const formProp = {
                [formpropname]:{
                    ...this.state,
                    handleChange:(name)=>{
                        return (event)=>{
                            let value;
                            if(event.target.type == "checkbox"){
                                value = event.target.checked;
                            }else{
                                value = event.target.value;
                            }
                            
                            this.updateValue.bind(this)(name,value,true);
                        }
                         
                    },
                    handleValue:(name) => {
                        return (value,setDirty = false)=>{
                            this.updateValue.bind(this)(name,value,setDirty)
                        }
                    }
                }
            }

            return (<Wrappedcomp {...formProp} {...this.props} />);
        }
    }
}

export default withForm;