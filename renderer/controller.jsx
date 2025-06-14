import React from 'react';
import './controller.css';

// components
import { 
    Button, Select, Label, Input, Radio, RadioGroup, Switch, InfoLabel, Textarea,
    Title1, Tooltip, Text , Divider, Link,
    Card, CardHeader, CardPreview,
    Body1, Body1Strong, Caption1, Caption1Strong,
    Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogContent,
    useToastController, Toast, ToastTitle, Toaster, ToastBody
} from '@fluentui/react-components';
// icons
import {
    ArrowResetRegular, InfoRegular, Dismiss24Regular, WarningRegular,
    ChatMultipleMinusRegular, BotRegular
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
    a: ({ children, href }) => (<Link onClick={()=>{window.electron_apis.shell.openExternal(href)}}>{children}</Link>),
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

const syspmt = {
    'en': ``,
    'zh': ``,
};


function App() {
    const toastId = React.useId('toaster');
    const { dispatchToast } = useToastController(toastId);
    const auto_scroll_ref = React.useRef(null);

    const [useasak, set_useasak] = React.useState(false);
    const [pmtlang, set_pmtlang] = React.useState('en');
    const [streaming, set_streaming] = React.useState(true);
    const [scrolling, set_scrolling] = React.useState(true);
    const [supplement, set_supplement] = React.useState('');
    const [asak_configusefile, set_asak_configusefile] = React.useState(true);
    const [asak_recordusefile, set_asak_recordusefile] = React.useState(true);
    const [jom_endpoint, set_jom_endpoint] = React.useState('');
    const [jom_apikey, set_jom_apikey] = React.useState('');
    const [jom_model, set_jom_model] = React.useState('');
    const [asak_config, set_asak_config] = React.useState('');
    const [asak_configvalid, set_asak_configvalid] = React.useState(false);
    const [asak_record, set_asak_record] = React.useState({});
    const [asak_recordfilepath, set_asak_recordfilepath] = React.useState('');
    const [asak_ai, set_asak] = React.useState(null);
    const [send2ai, set_send2ai] = React.useState('');
    const [chat_history, set_messages] = React.useState([{role: 'system', content: ''}]);
    const [generating , set_generating] = React.useState(false);

    React.useEffect(() => {
        const container = auto_scroll_ref.current;
        if (scrolling && container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        };
    }, [chat_history, scrolling]);


    return (
        <div className="main">
            <div className="left">

                {/* titlebar */}
                <div className='title-bar'>
                    <Title1>LMCanvas</Title1>
                    <div style={{flexGrow: 1}}></div>
                    <Tooltip content={'Reset'} relationship='label'>
                        <Button appearance="subtle" icon={<ArrowResetRegular />} onClick={()=>{
                            set_supplement('');
                            set_jom_endpoint('');
                            set_jom_apikey('');
                            set_jom_model('');
                            set_asak_config('');
                            set_asak_configvalid(false);
                            set_asak_record({});
                            set_asak_recordfilepath('');
                            set_asak(null);
                            set_messages([{role: 'system', content: ''}]);
                            set_generating(false);
                        }} />
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

TODO - Add something here 
                                    `}</MsgMD>
                                </DialogContent>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </div>

                {/* model basic settings */}
                <Label>System prompt language:</Label>
                <RadioGroup layout="horizontal" defaultValue='en' onChange={(e,data)=>{
                    set_pmtlang(data.value);
                    let old_history = JSON.parse(JSON.stringify(chat_history));
                    if(old_history.length === 0){
                        old_history.push({role: 'system', content: ''});
                    };
                    if(data.value === 'zh'){
                        old_history[0].content = syspmt['zh'];
                    } else {
                        old_history[0].content = syspmt['en'];
                    };
                    set_messages(old_history);
                }}>
                    <Radio label='English' value='en'></Radio>
                    <Radio label='Chinese' value='zh'></Radio>
                </RadioGroup>
                <div className='config-line'>
                    <Switch label='Streaming Output' checked={streaming} onChange={()=>set_streaming(!streaming)} />
                    <Switch label='Auto Scroll' checked={scrolling} onChange={()=>set_scrolling(!scrolling)} />
                </div>
                <Label>Supplementary information for AI:</Label>
                <Textarea resize="vertical" size="small" placeholder='you can add any additional information here, such as api key, cdn, lib, style, etc.' onChange={(e,data)=>{set_supplement(data.value);}} value={supplement}></Textarea>
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
                            file_ele.accept = '.json';
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
                                        set_asak(test);
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
                                    set_asak_record(asak_ai.recorder.get());
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
                            //console.log(window.electron_apis);
                            if(asak_config){
                                let result = await window.electron_apis.packed_functions.get_record_file();
                                if(!result.error){
                                    if(result.content){
                                        try{
                                            let record_file = JSON.parse(result.content);
                                            asak_ai.recorder.add(record_file);
                                            set_asak_record(asak_ai.recorder.get());
                                            set_asak_recordfilepath(result.path);
                                        }catch(e){
                                            dispatchToast(
                                                <Toast>
                                                    <ToastTitle>File Read Error</ToastTitle>
                                                    <ToastBody><Caption1>Record JSON is not valid or structure is not correct.<br />We will use the last valid json as record.</Caption1></ToastBody>
                                                </Toast>, { intent: 'error' }
                                            );
                                        };
                                    } else {
                                        set_asak_recordfilepath(result.path);
                                        dispatchToast(
                                            <Toast>
                                                <ToastTitle>File is empty</ToastTitle>
                                                <ToastBody><Caption1>we will rewrite it with the current record.</Caption1></ToastBody>
                                            </Toast>, { intent: 'ifo' }
                                        );
                                        window.electron_apis.fs.writeFile(result.path, JSON.stringify(asak_ai.recorder.get(), null, 4));
                                    };
                                } else {
                                    dispatchToast(
                                        <Toast>
                                            <ToastTitle>Error</ToastTitle>
                                            <ToastBody>{result.error}</ToastBody>
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
                    <Input appearance='outline' placeholder='Send message to AI' style={{width: '100%'}} onChange={(e, data)=>{set_send2ai(data.value);}}></Input>
                    <Button appearance='primary' disabled={generating} onClick={()=>{
                        set_messages([...chat_history, {
                            role: 'user',
                            content: send2ai,
                        }]);
                    }}>Send</Button>
                </div>
            </div>

            <div className="right">
                <div className='chats' ref={auto_scroll_ref}>
                    {chat_history.map((item, index)=>{
                        switch(item.role){
                            case 'system':
                                return null;
                            case 'user':
                                return (
                                    <Card key={`chat-${index}`} appearance='subtle'>
                                        <CardHeader 
                                            image={
                                                <ChatMultipleMinusRegular style={{fontSize: '20px'}} />
                                            }
                                            header={
                                                <Body1Strong>AI received message</Body1Strong>
                                            } />
                                        <CardPreview className='msg-container'>
                                            <MsgMD>{item.content}</MsgMD>
                                        </CardPreview>
                                    </Card>
                                );
                            case 'assistant':
                                return (
                                    <Card key={`chat-${index}`} appearance='outline'>
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
                                                <MsgMD>{item.content}</MsgMD>
                                            </Text>
                                        </CardPreview>
                                    </Card>
                                );
                        };
                    })}
                </div>
            </div>
        </div>
    );
}

export default App;