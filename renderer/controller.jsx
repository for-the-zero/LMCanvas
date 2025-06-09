import React from 'react';
import './controller.css';

// components
import { 
    Button, Select, Label, Input, Radio, RadioGroup, Switch, InfoLabel,
    Title1, Tooltip, Text , Divider, Link,
    Card, CardHeader, CardPreview,
    Body1, Body1Strong, Caption1,
    Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogContent,
    Caption1Strong,
    useToastController, Toast, ToastTitle, Toaster, ToastBody
} from '@fluentui/react-components';
// icons
import {
    ArrowResetRegular, InfoRegular, Dismiss24Regular, WarningRegular
} from '@fluentui/react-icons';
// markdown
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// ai
import asak from 'asakjs';

function CodeBlock({ node, inline, className, children, ...props }){
    const match = /(\w+):/.exec(className || '');
    
    return !inline && match ? (
        <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            {...props}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    ) : (
        <code {...props} style={{'padding': '1px','borderRadius': '3px', 'border': '1.5px solid gray'}}>
            {children}
        </code>
    );
};
const ThinkingBlock = ({ children }) => {
    return (
        <Card appearance='outline' size='small'>
            <CardHeader
                header={<Body1Strong>Thoughts:</Body1Strong>}
            />
            <CardPreview style={{padding: '8px', paddingTop: '0'}}>
                {children}
            </CardPreview>
        </Card>
    );
};

const markdown_cpnts = {
    strong: ({ children }) => (<Text weight="bold">{children}</Text>),
    em: ({ children }) => (<Text italic>{children}</Text>),
    u: ({ children }) => (<Text underline>{children}</Text>),
    del: ({ children }) => (<Text strikethrough>{children}</Text>),
    hr: () => <Divider />,
    a: ({ children, href }) => (<Link href={href}>{children}</Link>),
    code: CodeBlock,
    think: ({ children }) => (<ThinkingBlock>{children}</ThinkingBlock>),
};
const MsgMD = React.memo(({children})=>{
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={markdown_cpnts}
        >
            {children}
        </ReactMarkdown>
    )
});


function App() {
    const toastId = React.useId('toaster');
    const { dispatchToast } = useToastController(toastId);

    const [useasak, set_useasak] = React.useState(false);
    const [pmtlang, set_pmtlang] = React.useState('en');
    const [streaming, set_streaming] = React.useState(true);
    const [asak_configusefile, set_asak_configusefile] = React.useState(true);
    const [asak_recordusefile, set_asak_recordusefile] = React.useState(true);
    const [jom_endpoint, set_jom_endpoint] = React.useState('');
    const [jom_apikey, set_jom_apikey] = React.useState('');
    const [jom_model, set_jom_model] = React.useState('');
    const [asak_config, set_asak_config] = React.useState('');
    const [asak_configvalid, set_asak_configvalid] = React.useState(false);
    const [asak_record, set_asak_record] = React.useState({});
    const [asak_recordfilepath, set_asak_recordfilepath] = React.useState('');
    const [asak_core, set_asak] = React.useState(null);


    return (
        <div className="main">
            <div className="left">

                {/* titlebar */}
                <div className='title-bar'>
                    <Title1>LMCanvas</Title1>
                    <div style={{flexGrow: 1}}></div>
                    <Tooltip content={'Reset'} relationship='label'>
                        <Button appearance="subtle" icon={<ArrowResetRegular />} />
                    </Tooltip>
                    <Dialog>
                        <DialogTrigger disableButtonEnhancement>
                            <Tooltip content={'About'} relationship='label'>
                                <Button appearance="subtle" icon={<InfoRegular />} />
                            </Tooltip>
                        </DialogTrigger>
                        <DialogSurface>
                            <DialogBody>
                                <DialogTitle 
                                    action={
                                        <DialogTrigger action="close">
                                            <Button
                                                appearance="subtle"
                                                aria-label="close"
                                                icon={<Dismiss24Regular />}
                                            />
                                        </DialogTrigger>
                                    }
                                >
                                    About LMCanvas
                                </DialogTitle>
                                <DialogContent>
                                    <MsgMD>{`
Go to see my [Github repo](https://github.com/for-the-zero/LMcanvas)

UI: [Fluent UI React Components](https://react.fluentui.dev/)

TODO - Add description here 
                                    
                                    `}</MsgMD>
                                </DialogContent>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </div>

                {/* model basic settings */}
                <Label>System prompt language:</Label>
                <RadioGroup layout="horizontal" defaultValue='en' onChange={(e,data)=>{set_pmtlang(data.value);}}>
                    <Radio label='English' value='en'></Radio>
                    <Radio label='Chinese' value='zh'></Radio>
                </RadioGroup>
                <Switch label='Streaming Output' checked={streaming} onChange={()=>set_streaming(!streaming)} />
                <Label>Mode</Label>
                <Select defaultValue='Just one model' onChange={(e,data)=>{set_useasak(data.value === 'asak' ? true : false)}}>
                    <option>Just one model</option>
                    <option>asak</option>
                </Select>

                {/* jom settings */}
                <div className='jom-configs' style={{display: useasak? 'none' : 'block'}}>
                    <div className='config-line'>
                        <InfoLabel info={'Without /chat/completions'} label='API Endpoint:'></InfoLabel>
                        <Input appearance='outline' placeholder='e.g. https://generativelanguage.googleapis.com/v1beta/openai' onChange={(e,data)=>{set_jom_endpoint(data.value);}}></Input>
                    </div>
                    <div className='config-line'>
                        <Label>API Key:</Label>
                        <Input appearance='outline' type="password" placeholder='e.g. sk-NeverGonnaGiveYouUp' onChange={(e,data)=>{set_jom_apikey(data.value);}}></Input>
                    </div>
                    <div className='config-line'>
                        <Label>Model:</Label>
                        <Input appearance='outline' placeholder='e.g. gemini-2.5-pro-preview-06-05' onChange={(e,data)=>{set_jom_model(data.value);}}></Input>
                    </div>
                </div>

                {/* asak settings */}
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
                        <Button appearance='default' onClick={()=>{
                            let file_ele = document.createElement('input');
                            file_ele.type = 'file';
                            file_ele.onchange = (e)=>{
                                let file = e.target.files[0];
                                let reader = new FileReader();
                                reader.readAsText(file);
                                reader.onload = (e)=>{
                                    try{
                                        let input_config = JSON.parse(e.target.result);
                                        let test = new asak(input_config);
                                        set_asak_config(input_config);
                                        set_asak_configvalid(true);
                                    }catch(e){
                                        dispatchToast(
                                            <Toast>
                                                <ToastTitle>File Read Error</ToastTitle>
                                                <ToastBody><Caption1>Config JSON is not valid or structure is not correct.<br />We will use the last valid json as config.</Caption1></ToastBody>
                                            </Toast>, { intent: 'error' }
                                        );
                                    };
                                };
                                reader.onerror = (e)=>{
                                    dispatchToast(
                                        <Toast>
                                            <ToastTitle>File Read Error</ToastTitle>
                                        </Toast>, { intent: 'error' }
                                    );
                                };
                            };
                            file_ele.click();
                        }}>Choose File</Button>
                    </div>
                    <div className='config-line' style={{display: asak_configusefile ? 'none' : 'grid'}}>
                        <Label>Config JSON:</Label>
                        <Input appearance='underline' placeholder='Paste your config here'
                            onChange={(e,data)=>{
                                try{
                                    let input_config = JSON.parse(data.value);
                                    let test = new asak(input_config);
                                    set_asak_config(input_config);
                                    set_asak(test);
                                    set_asak_record(asak_core.recorder.get());
                                    set_asak_configvalid(true);
                                }catch(e){
                                    console.log(e);
                                    set_asak_configvalid(false);
                                };
                            }}
                            contentAfter={
                                <Tooltip content={(
                                    <Caption1>JSON format is incorrect or structure is not correct<br />We will use the last valid json as config.</Caption1>
                                )} relationship='label'>
                                    <WarningRegular style={{'display': asak_configvalid ? 'none' : 'inline-block'}} />
                                </Tooltip>
                            }
                        ></Input>
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
                        <Button appearance='default' onClick={async()=>{
                            console.log(window.electron_apis);
                            if(asak_config){
                                let file = await window.electron_apis.dialog.showOpenDialog({ //TODO: can't access
                                    properties: ['openFile'],
                                    filters: [{ name: 'JSON', extensions: ['json'] }]
                                });
                                if(file.filePaths.length > 0){
                                    let filepath = file.filePaths[0];
                                    set_asak_recordfilepath(filepath);
                                    try{
                                        let record = await window.electron_apis.fs.readFile(filepath, 'utf-8'); //TODO:
                                        record = JSON.parse(record);
                                        asak_core.recorder.add(record);
                                        set_asak_record(asak_core.recorder.get());
                                    } catch(e){
                                        dispatchToast(
                                            <Toast>
                                                <ToastTitle>Not a record file</ToastTitle>
                                                <ToastBody><Caption1>We will rewrite this file.</Caption1></ToastBody>
                                            </Toast>, { intent: 'error' }
                                        );
                                    };
                                } else {
                                    dispatchToast(
                                        <Toast>
                                            <ToastTitle>No file selected</ToastTitle>
                                        </Toast>, { intent: 'info' }
                                    );
                                };
                            } else {
                                dispatchToast(
                                    <Toast>
                                        <ToastTitle>Set your config first!</ToastTitle>
                                    </Toast>, { intent: 'info' }
                                );
                                return;
                            };
                        }}>Choose File</Button>
                    </div>
                    <div className='config-line' style={{display: asak_recordusefile ? 'none' : 'grid'}}>
                        <Label>Record JSON:</Label>
                        <Input appearance='underline' disabled={true} value={JSON.stringify(asak_record)}></Input>
                    </div>
                </div>
                <Toaster toasterId={toastId} />

                {/* ask */}
                <Divider />
                <div className='ask'>
                    <Input appearance='outline' placeholder='Send message to AI' style={{width: '100%'}}></Input>
                    <Button appearance='primary'>Send</Button>
                </div>
            </div>

            <div className="right">
                <div className='chats'>
                    
                    {/* 
                    // user message
                    <Card appearance='subtle'>
                        <CardHeader 
                            image={
                                <ChatMultipleMinusRegular style={{fontSize: '20px'}} />
                            }
                            header={
                                <Body1Strong>AI received message</Body1Strong>
                            } />
                        <CardPreview className='msg-container'>
                            <Body1>{``}</Body1>
                        </CardPreview>
                    </Card>
                    
                    // ai response
                    <Card appearance='outline'>
                        <CardHeader 
                            image={
                                <BotRegular style={{fontSize: '20px'}} />
                            }
                            header={
                                <Body1Strong>Response</Body1Strong>
                            }
                        />
                        <CardPreview className='msg-container'>
                            <Text>
                                <MsgMD>
                                    {``}
                                </MsgMD>
                            </Text>
                        </CardPreview>
                    </Card> 
                    */}

                </div>
            </div>
        </div>
    );
}

export default App;