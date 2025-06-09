import React from 'react';
import './controller.css';

// components
import { 
    Button, Select, Label, Input, Radio, RadioGroup, Switch, InfoLabel,
    Title1, Tooltip, Text , Divider, Link,
    Card, CardHeader, CardPreview,
    Body1, Body1Strong,
    Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogContent,
} from '@fluentui/react-components';
// icons
import {
    ArrowResetRegular, InfoRegular, Dismiss24Regular,
    ChatMultipleMinusRegular, BotRegular
} from '@fluentui/react-icons';
// markdown
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
                <div className='chats'>

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
                                    {`
<think>

段落 **粗体**、*斜体* 和 \`console.log()\` [链接](https://github.com)

</think>

# 主标题 H1

## 副标题 H2

114514

1. 列表1
2. 列表2
3. 列表3

- 1
    - 1.1
    - 1.2
- 2

\> 引用

\`\`\`javascript:run
console.log('Hello, world!');
\`\`\`

\`\`\`json:call
{"a": "b", "c": 114514}
\`\`\`

---

                                    `}
                                </MsgMD>
                            </Text>
                        </CardPreview>
                    </Card>

                </div>
            </div>
        </div>
    );
}

export default App;