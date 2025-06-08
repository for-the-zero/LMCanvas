import React from 'react';
import './controller.css';

// components
import { 
    tokens,
    Button, Select, Label, Input, Radio, RadioGroup, Switch, InfoLabel,
    Title1, Tooltip, Avatar, Divider,
    Card, CardHeader, CardPreview,
    Body1, Body1Strong
} from '@fluentui/react-components';
import { Collapse } from '@fluentui/react-motion-components-preview';
// icons
import {
    ArrowResetRegular, SaveRegular,
    ChatMultipleMinusRegular, BotRegular, ThinkingRegular, CodeBlockRegular, ArrowCollapseAllRegular
} from '@fluentui/react-icons';

function CollapseCard({title, children}){
    const [open, set_open] = React.useState(false);
    return (
        <Card appearance='outline'
            selected={open} onSelectionChange={(e,{selected})=>{set_open(selected)}}
            style={open? {backgroundColor: tokens.colorNeutralBackground3} : {}}
        >
            <CardHeader 
                image={
                    (title === 'Thoughts') ? <ThinkingRegular style={{fontSize: '20px'}} /> : 
                    <CodeBlockRegular style={{fontSize: '20px'}} />
                }
                header={
                    <Body1Strong>{title}</Body1Strong>
                }
            />
            {/* <CardPreview className='msg-container' style={{overflow: 'scroll', maxHeight: '150px'}}>
                <Collapse visible={open}>
                    {children}
                </Collapse>
            </CardPreview> */}
            <Collapse visible={open}>
                <CardPreview className='msg-container' style={{overflow: 'scroll', maxHeight: '150px'}}>
                    {children}
                </CardPreview>
            </Collapse>
        </Card>
    )
};

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
                        <Input appearance='underline' disabled={true} value="Here's the record"></Input>
                    </div>
                </div>

                <Divider />
                <div className='ask'>
                    <Input appearance='outline' placeholder='Send message to AI' style={{width: '100%'}}></Input>
                    <Button appearance='primary'>Send</Button>
                </div>
            </div>

            <div className="right">

                <Card appearance='subtle'>
                    <CardHeader 
                        image={
                            <ChatMultipleMinusRegular style={{fontSize: '20px'}} />
                        }
                        header={
                            <Body1Strong>AI received message</Body1Strong>
                        } />
                    <CardPreview className='msg-container'>
                        <Body1>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nisi, ipsam sequi minima optio in vel sed dicta blanditiis cumque ipsum quidem culpa totam commodi quasi odio aliquid a accusamus temporibus.<br /></Body1>
                    </CardPreview>
                </Card>

                <Card>
                    <CardHeader 
                        image={
                            <BotRegular style={{fontSize: '20px'}} />
                        }
                        header={
                            <Body1Strong>Response</Body1Strong>
                        }
                    />
                    <CardPreview className='msg-container'>
                        <CollapseCard title='Thoughts'>
                            <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt dolores corrupti neque numquam repellendus distinctio, pariatur unde id tempora natus! Praesentium fugiat totam vitae possimus placeat deleniti! Mollitia, sit id!Lorem Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptates explicabo fugiat nobis culpa vel expedita deserunt, aspernatur magnam error at officia, dolor neque. Praesentium quae voluptatum voluptates totam. Velit, rerum.</Body1>
                        </CollapseCard>
                        <Body1>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Eveniet ea corrupti quibusdam minus voluptatum sapiente ratione nemo assumenda quae? Minima natus qui quae iusto doloribus tempore non nam quia quo!<br /></Body1>
                        <CollapseCard title='JavaScript'>
                            <Body1>Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt dolores corrupti neque numquam repellendus distinctio, pariatur unde id tempora natus! Praesentium fugiat totam vitae possimus placeat deleniti! Mollitia, sit id!</Body1>
                        </CollapseCard>
                    </CardPreview>
                </Card>
            </div>
        </div>
    );
}

export default App;