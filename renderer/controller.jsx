import React from 'react';
import './controller.css';

// components
import { 
    Button, Select, Label, Input, Radio, RadioGroup, Switch, InfoLabel,
    Title1, Tooltip, Avatar, Divider
} from '@fluentui/react-components';
// icons
import {
    ArrowResetRegular,
    SaveRegular
} from '@fluentui/react-icons';

function App() {
    const [useasak, set_useasak] = React.useState(false);
    const [streaming, set_streaming] = React.useState(true);
    const [asak_configusefile, set_asak_configusefile] = React.useState(true);
    const [asak_recordusefile, set_asak_recordusefile] = React.useState(true);



    return (
        <div className="main">
            <div className="left">

                <div className='title-bar'>
                    <Title1>LMCanvas</Title1>
                    <div style={{flexGrow: 1}}></div>
                    <Tooltip content={'Reset'} relationship='label'>
                        <Button appearance="subtle" icon={<ArrowResetRegular />} />
                    </Tooltip>
                    <Tooltip content={'Save'} relationship='label'>
                        <Button appearance="subtle" icon={<SaveRegular />} />
                    </Tooltip>
                </div>

                <Label>System prompt language:</Label>
                <RadioGroup layout="horizontal" defaultValue='en'>
                    <Radio label='English' value='en'></Radio>
                    <Radio label='Chinese' value='zh'></Radio>
                </RadioGroup>
                <Switch label='Streaming Output' checked={streaming} onChange={()=>set_streaming(!streaming)} />
                <Label>Mode</Label>
                <Select defaultValue='Just one model' onChange={(e,data)=>{set_useasak(data.value === 'asak' ? true : false)}}>
                    <option>Just one model</option>
                    <option>asak</option>
                </Select>

                <div className='jom-configs' style={{display: useasak? 'none' : 'block'}}>
                    <div className='config-line'>
                        <InfoLabel info={'Without /chat/completions'} label='API Endpoint:'></InfoLabel>
                        <Input appearance='outline' placeholder='e.g. https://generativelanguage.googleapis.com/v1beta/openai'></Input>
                    </div>
                    <div className='config-line'>
                        <Label>API Key:</Label>
                        <Input appearance='outline' type="password" placeholder='e.g. sk-NeverGonnaGiveYouUp'></Input>
                    </div>
                    <div className='config-line'>
                        <Label>Model:</Label>
                        <Input appearance='outline' placeholder='e.g. gemini-2.5-pro-preview-06-05'></Input>
                    </div>
                </div>

                <div className='asak-configs' style={{display: useasak? 'block' : 'none'}}>
                    <div className='config-line'>
                        <Label>Config:</Label>
                        <RadioGroup layout="horizontal" defaultValue='file' onChange={(e,data)=>{set_asak_configusefile(data.value === 'file' ? true : false)}}>
                            <Radio label='File' value='file'></Radio>
                            <Radio label='Paste here' value='paste'></Radio>
                        </RadioGroup>
                    </div>
                    <div className='config-line' style={{display: asak_configusefile ? 'grid' : 'none'}}>
                        <Label>Config File:</Label>
                        <Button appearance='default'>Choose File</Button>
                    </div>
                    <div className='config-line' style={{display: asak_configusefile ? 'none' : 'grid'}}>
                        <Label>Config JSON:</Label>
                        <Input appearance='underline' placeholder='Paste your config here'></Input>
                    </div>
                    <div className='config-line'>
                        <Label>Record:</Label>
                        <RadioGroup layout="horizontal" defaultValue='file' onChange={(e,data)=>{set_asak_recordusefile(data.value === 'file' ? true : false)}}>
                            <Radio label='File' value='file'></Radio>
                            <Radio label='Copy as Text' value='copy'></Radio>
                        </RadioGroup>
                    </div>
                    <div className='config-line' style={{display: asak_recordusefile ? 'grid' : 'none'}}>
                        <Label>Record File:</Label>
                        <Button appearance='default'>Choose File</Button>
                    </div>
                    <div className='config-line' style={{display: asak_recordusefile ? 'none' : 'grid'}}>
                        <Label>Record JSON:</Label>
                        <Input appearance='underline' disabled="true" value="Here's the record"></Input>
                    </div>
                </div>

                <Divider />
                <div className='ask'>
                    <Input appearance='outline' placeholder='Send message to AI' style={{width: '100%'}}></Input>
                    <Button appearance='primary'>Send</Button>
                </div>
            </div>
            <div className="right">
                <Title1>Waiting for Developement</Title1>
            </div>
        </div>
    );
}

export default App;