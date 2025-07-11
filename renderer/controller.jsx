import React from 'react';
import './controller.css';

// components
import { 
    Button, Dropdown, Option, Label, Input, Radio, RadioGroup, Switch, InfoLabel, Textarea,
    Title1, Tooltip, Text , Divider, Link,
    Card, CardHeader, CardPreview,
    Body1, Body1Strong, Caption1, Caption1Strong,
    Dialog, DialogTrigger, DialogSurface, DialogTitle, DialogBody, DialogContent,
    useToastController, Toast, ToastTitle, Toaster, ToastBody
} from '@fluentui/react-components';
// icons
import {
    ArrowResetRegular, InfoRegular, Dismiss24Regular, WarningRegular,
    ChatMultipleMinusRegular, BotRegular, CopyRegular, ThinkingRegular
} from '@fluentui/react-icons';
// markdown
import ReactMarkdown from 'react-markdown';
import hljs from 'highlight.js';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// ai
import asak from 'asakjs';
import {OpenAI} from 'openai';


function apply_to_canvas(content){
    let final_content = '';
    let regex = /```([^\n]+)?\n([\s\S]*?)```/g;
    let last_jsrun = null;
    let last_js = null;
    let match;
    while ((match = regex.exec(content)) !== null) {
        let lang = match[1] ? match[1].trim() : '';
        let code = match[2];
        if (lang === 'js:run') {
            last_jsrun = code;
        } else if (lang.toLowerCase() === 'javascript' || lang.toLowerCase() === 'js'){
            last_js = code;
        };
    };
    final_content = last_jsrun || last_js || '';
    console.log(final_content);
    window.electron_apis.ipcRenderer.send('controller2main', final_content);
};


function CodeBlock({ node, inline, className, children, ...props }) {
    let isblock = String(children).includes('\n');
    let hasLanguageClass = className?.startsWith('language-');
    if (isblock || hasLanguageClass) {
        let match = /language-([\w:]+)/.exec(className || '');
        let language = match ? match[1] : 'plaintext';
        if (language === 'js:run') {
            language = 'javascript';
        } else if (language === 'plaintext') {
            let code_content = String(children).replace(/\n$/, '');
            let detected = hljs.highlightAuto(code_content);
            language = detected.language || 'plaintext';
        };
        return (
            <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        );
    } else {
        return (
            <code
                {...props}
                className={className}
                style={{'padding': '1px','borderRadius': '3px', 'border': '1.5px solid gray'}}
            >
                {children}
            </code>
        );
    };
};
const ThinkingBlock = ({ children }) => {
    return (
        <Card appearance='outline' size='small'>
            <CardHeader
                header={<Body1Strong>Thoughts:</Body1Strong>}
                image={<ThinkingRegular style={{fontSize: '18px'}} />}
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
};
const MsgMD = React.memo(({ children }) => {
    let content = String(children || '');
    let segments = [];
    let currentIndex = 0;
    while (currentIndex < content.length) {
        let thinkStartIndex = content.indexOf('<think>', currentIndex);
        if (thinkStartIndex === -1) {
            segments.push({ type: 'normal', content: content.substring(currentIndex) });
            break;
        };
        if (thinkStartIndex > currentIndex) {
            segments.push({ type: 'normal', content: content.substring(currentIndex, thinkStartIndex) });
        };
        let thinkEndIndex = content.indexOf('</think>', thinkStartIndex + 7);
        if (thinkEndIndex !== -1) {
            let thinkContent = content.substring(thinkStartIndex + 7, thinkEndIndex);
            segments.push({ type: 'think', content: thinkContent });
            currentIndex = thinkEndIndex + 8;
        } else {
            let thinkContent = content.substring(thinkStartIndex + 7);
            segments.push({ type: 'think', content: thinkContent });
            break;
        };
    };
    return (
        <>
            {segments.map((segment, index) => {
                if (!segment.content) {
                    return null;
                };
                if (segment.type === 'think') {
                    return (
                        <ThinkingBlock key={index}>
                            <ReactMarkdown components={markdown_cpnts}>
                                {segment.content}
                            </ReactMarkdown>
                        </ThinkingBlock>
                    );
                } else {
                    return (
                        <ReactMarkdown key={index} components={markdown_cpnts}>
                            {segment.content}
                        </ReactMarkdown>
                    );
                };
            })}
        </>
    );
});

// prompt codes: here -> line 158
// 说实话，效果怎么样全靠模型行不行，觉得生成得烂还是换模型吧
const syspmt = {
    'en': `# Role and Goal

You are a top-tier full-stack developer and a talented UI designer. Your core expertise is in front-end development using vanilla HTML, CSS, and JavaScript, and you are capable of leveraging specific Node.js and Electron APIs to build desktop application features. Your task is to output a brief implementation plan and executable JS code (only in \`js:run\` blocks) based on user requests, to create and modify a dynamic front-end page that is both **functional and aesthetically pleasing**.

# Environment and Rules

1.  **Execution Environment**: Your JavaScript code will ultimately be executed within an **Electron Renderer Process**. The host application will receive your code via an IPC channel and execute it.
2.  **State Management**: **Core Rule** — Your execution environment is **stateful and persistent**. Global variables, functions, or DOM modifications declared in one \`js:run\` code block will be fully preserved for the next execution. You can leverage this feature to manage the application's state using JavaScript variables.
3.  **Initial State**: You start with a basic HTML skeleton: \`<html><script>/*Do not touch this code; it is used for send2ai function operations*/</script><head><body></body>\`.
4.  **Code Execution**: All executable code must be wrapped in a special Markdown code block, \`js:run\`. This means the language for the code block must be specified as \`js:run\`, not \`javascript\` or \`js\`. This is absolutely critical and cannot be incorrect.
5.  **Error Handling**: If your code encounters an error during execution, the system will catch it and feed it back to you via \`send2ai\`. Your task is to correct the code and provide a version that can execute correctly, based on the state before the error occurred.
6.  **Available APIs**:
    * You can use all standard **Web APIs**.
    * You can use the **Node.js** \`fs\` (file system) and \`path\` modules, accessible via \`window.electronAPI.fs\` and \`window.electronAPI.path\`.
    * You can access a specific set of **Electron APIs** through the \`window.electronAPI\` object, including \`clipboard\`, \`fetch\` (for cross-origin requests), and \`shell\`, not allowed to use \`ipcrenderer\`.
    * You may use a small number of Node.js built-in libraries, as long as you can ensure they are usable within an Electron renderer process.

# Conception and Coding

To generate high-quality code, you can "conceive first, then code." Before writing code, you can briefly describe your implementation ideas. This can include how you plan to organize the HTML structure, design CSS styles, and implement core functionalities and event-handling logic. This helps you clarify your thoughts. Note that the interface must be aesthetically pleasing.

# The Core Role of the \`send2ai()\` Function

\`send2ai(text: string)\` is your core tool for asynchronous communication and event-driven development with the system.

* **Return Value**: This function does not return any value in JavaScript.
* **Communication Mechanism**: Calling this function sends a text message to the host application. This message will be processed and provided back to you in the next turn as a new instruction or context.
* **Usage Examples**:
    * **Handling User Interaction**: e.g., \`button.addEventListener('click', () => send2ai('User clicked the save button'));\`
    * **Requesting Information**: e.g., \`send2ai('Please provide the current HTML content of the element with id="user-list"')\` or \`send2ai('I need the user's configuration data')\`.
    * **Triggering Subsequent Code Generation**: e.g., \`placeholder.addEventListener('click', () => send2ai('Dynamically generate a data table here'));\`
    * **Passing Client-Side Data**: e.g., \`send2ai(\\\`Need to process form data: \${JSON.stringify(formData)}\\\`);\`

# UI/UX Design Principles

1.  **Modern Style**: When the user has no specific requirements, default to creating a modern, aesthetically pleasing interface with a clean layout.
2.  **Interface Language**: Set the language for the UI text based on the language the user used in their request. If the user makes a request in Chinese, the interface elements (e.g., button text, labels) should also be in Chinese.`,
    // 987 tokens for Gemini 2.5 Pro Preview
    'zh': `# 角色与目标

你是一位顶级的全栈开发者，同时也是一位出色的UI设计师。你的核心专长是使用原生HTML、CSS和JavaScript进行前端开发，并能利用Node.js和Electron的特定API构建桌面应用功能。你的任务是根据用户的需求，输出简要的实现思路和可执行的js代码（只接受\`js:run\`代码块），以创建和修改一个**功能强大且界面美观**的动态前端页面

# 环境与规则

1.  **执行环境**: 你的JavaScript代码最终会在一个**Electron渲染进程(Renderer Process)**中执行。主机应用会通过IPC通道接收你的代码并执行它
2.  **状态管理**: **核心规则** — 你的执行环境是**有状态且持久的**。在一个\`js:run\`代码块中声明的全局变量、函数或对DOM的修改，将会被完整地保留到下一次执行。你可以利用这个特性，通过JavaScript变量来管理应用的状态
3.  **初始状态**: 你从一个仅包含\`<html><script>/*这段代码不要动，用于send2ai函数的相关操作*/</script><head><body></body>\`的基础HTML骨架开始。
4.  **代码执行**: 所有可执行代码都必须包裹在特殊的Markdown代码块 \`js:run\` 中，也就是代码块的语言填写为 \`js:run\`而不是 \`javascript\` 或 \`js\`，这个绝对不能错误
5.  **错误处理**: 如果代码执行出错，系统会捕获错误并通过\`send2ai\`反馈给你。你的任务是修正代码，并在错误发生前的状态基础上，提供能正确执行的版本
6.  **可用API**:
    * 你可以使用所有标准的**Web API**
    * 你可以使用**Node.js**的\`fs\` (文件系统) 和 \`path\` (路径) 模块，通过\`window.electronAPI.fs\`和\`window.electronAPI.path\`进行访问
    * 你可以通过\`window.electronAPI\`对象访问一组特定的**Electron API**，包括\`clipboard\`, \`fetch\` (用于跨域请求), 和\`shell\`，不允许使用\`ipcrenderer\`
    * 你可以使用少量node内置库，只要能够确保它可以在electron渲染进程中使用即可

# 构思与编码

为了生成高质量的代码，你可以“先构思，后编码”，在编写代码之前可以简要描述你的实现思路。这可以包括你打算如何组织HTML结构、设计css样式，以及实现核心功能和事件处理的逻辑，帮助你理清思路，注意界面必须要美观

# \`send2ai()\` 函数的核心作用

\`send2ai(text: string)\` 是你与系统进行异步通信和事件驱动开发的核心工具

* **返回值**: 此函数在JavaScript中不返回任何值
* **通信机制**: 调用此函数会向主机应用发送一条文本消息。该消息将被处理，并作为新的指令或上下文在下一轮交互中提供给你
* **用途示例**:
    * **处理用户交互**: 例如\`button.addEventListener('click', () => send2ai('用户点击了保存按钮'));\`
    * **请求所需信息**: 例如\`send2ai('请提供ID为"user-list"的元素的当前HTML内容')\` 或 \`send2ai('我需要用户的配置信息')\`
    * **触发后续代码生成**: 例如\`placeholder.addEventListener('click', () => send2ai('在此处动态生成一个数据表格'));\`
    * **传递客户端数据**: 例如\`send2ai(\\\`需要处理表单数据: \${JSON.stringify(formData)}\\\`);\`

# UI/UX 设计原则

1.  **现代风格**: 当用户没有具体要求时，默认创建具有现代美观设计、布局清晰的界面
2.  **界面语言**: 根据用户提出需求时所用的语言，来设定UI中的文本语言。若用户使用中文，则界面应使用中文`,
    // 864 tokens for Gemini 2.5 Pro Preview
};

var is_ipc_reg = false;

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
    const [asak_mode, set_asak_mode] = React.useState('index');
    const [asak_ai, set_asak] = React.useState(null);
    const [send2ai, set_send2ai] = React.useState('');
    const [chat_history, set_chathistory] = React.useState([{role: 'system', content: syspmt_generator(pmtlang, '')}]);
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
    const request_ai_ref = React.useRef(request_ai);
    React.useEffect(() => {;
        request_ai_ref.current = request_ai;
    }, [request_ai]);
    React.useEffect(() => {
        const get_from_canvas = (event, msg) => {
            console.log(msg);
            if(msg){
                request_ai_ref.current(msg);
            };
        };
        if(!is_ipc_reg){
            window.electron_apis.ipcRenderer.on('main2controller', get_from_canvas);
            is_ipc_reg = true;
        };
    }, []);

    function syspmt_generator(f_lang, f_supplement){
        let pmt = syspmt[f_lang];
        if(f_supplement){
            if(f_lang === 'en'){
                pmt += `\n\n---\n\nSupplement from user: \n${f_supplement}`;
            } else {
                pmt += `\n\n---\n\n用户提供的补充信息: \n${f_supplement}`;
            };
        };
        return pmt;
    };

    async function request_ai(received_message){
        let cfg = {
            base_url: '',
            key: '',
            model: '',
        };
        if(useasak){
            if(asak_configvalid){
                set_generating(true);
                let res = asak_ai.get_model(mode=asak_mode);
                cfg = {
                    base_url: res.base_url,
                    key: res.key,
                    model: res.model,
                };
            } else {
                dispatchToast(<Toast>
                    <ToastTitle>Error</ToastTitle>
                    <ToastBody><Caption1>Please provide valid asak config</Caption1></ToastBody>
                </Toast>, {appearance: 'error'});
                return;
            };
        } else {
            if(jom_endpoint !== '' && jom_apikey !== '' && jom_model !== ''){
                set_generating(true);
                cfg = {
                    base_url: jom_endpoint,
                    key: jom_apikey,
                    model: jom_model,
                };
            } else {
                dispatchToast(<Toast>
                    <ToastTitle>Error</ToastTitle>
                    <ToastBody><Caption1>Please provide valid config</Caption1></ToastBody>
                </Toast>, {appearance: 'error'});
                return;
            };
        };
        let openai_cilent = new OpenAI({
            apiKey: cfg.key,
            baseURL: cfg.base_url,
            dangerouslyAllowBrowser: true,
        });
        let new_chathistory = [...chat_history];
        new_chathistory.push({role: 'user', content: received_message});
        set_chathistory(new_chathistory);
        if(streaming){
            let new_msg = {role: 'assistant', content: ''};
            set_chathistory(prev => [...prev, new_msg]);
            try{
                let res = await openai_cilent.chat.completions.create({
                    model: cfg.model,
                    messages: new_chathistory,
                    stream: true
                });
                for await (let part of res){
                    let delta = part.choices[0]?.delta;
                    if(delta){
                        if(delta.reasoning || delta.reasoning_content){
                            const reasoning = delta.reasoning || delta.reasoning_content;
                            if (!new_msg.content.startsWith('<think>')) {
                                new_msg.content += '<think>\n';
                            };
                            new_msg.content += reasoning;
                        } else if (delta.content) {
                            if (new_msg.content.startsWith('<think>') && !new_msg.content.includes('</think>')) {
                                new_msg.content += '\n</think>\n';
                            };
                            new_msg.content += delta.content;
                        };
                        set_chathistory(prev=>{
                            let new_history = [...prev];
                            let last_index = new_history.length - 1;
                            new_history[last_index] = new_msg;
                            return new_history;
                        });
                    };
                };
            } catch(e){
                dispatchToast(<Toast>
                    <ToastTitle>Error</ToastTitle>
                    <ToastBody><Caption1>{e.message}</Caption1></ToastBody>
                </Toast>, {appearance: 'error'});
                set_generating(false);
            };
            console.log(new_msg.content);
            apply_to_canvas(new_msg.content);
        } else {
            let new_msg = {role: 'assistant', content: ''};
            set_chathistory(prev => [...prev, new_msg]);
            try{
                let res = await openai_cilent.chat.completions.create({
                    model: cfg.model,
                    messages: new_chathistory,
                    stream: false
                });
                let msg = res.choices[0]?.message;
                if(msg){
                    if(msg.reasoning || msg.reasoning_content){
                        let reasoning = msg.reasoning || msg.reasoning_content;
                        new_msg.content = `<think>\n${reasoning}\n</think>\n`;
                    };
                    if(msg.content){
                        new_msg.content += msg.content;
                    };
                };
                set_chathistory(prev => {
                    let new_history = [...prev];
                    let last_index = new_history.length - 1;
                    new_history[last_index] = new_msg;
                    return new_history;
                });
                console.log(new_msg.content);
                apply_to_canvas(new_msg.content);
            }catch(e){
                dispatchToast(<Toast>
                    <ToastTitle>Error</ToastTitle>
                    <ToastBody><Caption1>{e.message}</Caption1></ToastBody>
                </Toast>, {appearance: 'error'});
                set_generating(false);
            };
        };
        set_generating(false);
    };


    return (
        <div className="main">
            <div className="left">

                {/* titlebar */}
                <div className='title-bar'>
                    <Title1>LMCanvas</Title1>
                    <div style={{flexGrow: 1}}></div>
                    <Tooltip content={'Reset'} relationship='label'>
                        <Button appearance="subtle" icon={<ArrowResetRegular />} onClick={()=>{
                            set_asak_config('');
                            set_asak_configvalid(false);
                            set_asak_record({});
                            set_asak_recordfilepath('');
                            set_asak(null);
                            set_chathistory([{role: 'system', content: syspmt_generator(pmtlang, supplement)}]);
                            set_generating(false);
                            window.electron_apis.ipcRenderer.send('reset');
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
**Links**:

> [Github Link(more details here)](https://github.com/for-the-zero/LMcanvas)
> 
> [Where can we find free LLM apis](https://github.com/for-the-zero/Free-LLM-Collection)
> 
> What is [asak](https://github.com/for-the-zero/asak)?
> 
> UI: [Fluent UI React Components](https://react.fluentui.dev/)

TODO - add contents here
                                    `}</MsgMD>
                                </DialogContent>
                            </DialogBody>
                        </DialogSurface>
                    </Dialog>
                </div>

                {/* model basic settings */}
                <Label>System prompt language:</Label>
                <RadioGroup layout="horizontal" defaultValue='en' onChange={(e,data)=>{
                    let new_lang = data.value;
                    set_pmtlang(new_lang);
                    set_chathistory(prev => {
                        let new_history = [...prev];
                        if (new_history.length === 0 || new_history[0].role !== 'system') {
                            return [{ role: 'system', content: syspmt_generator(new_lang, supplement) }];
                        };
                        new_history[0].content = syspmt_generator(new_lang, supplement);
                        return new_history;
                    });
                }}>
                    <Radio label='English' value='en'></Radio>
                    <Radio label='Chinese' value='zh'></Radio>
                </RadioGroup>
                <div className='config-line'>
                    <Switch label='Streaming Output' checked={streaming} onChange={()=>set_streaming(!streaming)} />
                    <Switch label='Auto Scroll' checked={scrolling} onChange={()=>set_scrolling(!scrolling)} />
                </div>
                <Label>Supplementary information for AI:</Label>
                <Textarea resize="vertical" size="small" placeholder='You can add any additional information here, such as api key, cdn, lib, style, etc.' onChange={(e,data)=>{
                    let new_supplement = data.value;
                    set_supplement(new_supplement);
                    set_chathistory(prev => {
                        let new_history = [...prev];
                        if (new_history.length === 0 || new_history[0].role !== 'system') {
                            return [{ role: 'system', content: syspmt_generator(pmtlang, new_supplement) }];
                        };
                        new_history[0].content = syspmt_generator(pmtlang, new_supplement);
                        return new_history;
                    });
                }}></Textarea>
                <Label>Mode</Label>
                <Dropdown defaultValue='Just one model' onActiveOptionChange={(e,data)=>{set_useasak(data.nextOption.value === 'asak' ? true : false)}}>
                    <Option>Just one model</Option>
                    <Option>asak</Option>
                </Dropdown>

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
                        <Input appearance='outline' placeholder='e.g. gemini-2.5-pro' onChange={(e,data)=>{set_jom_model(data.value);}}></Input>
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
                        <Button appearance='default' disabled={asak_configvalid ? false : true} onClick={async()=>{
                            //console.log(window.electron_apis);
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
                                        </Toast>, { intent: 'info' }
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
                        }}>Choose File</Button>
                    </div>
                    <div className='config-line' style={{display: asak_recordusefile ? 'none' : 'grid'}}>
                        <Label>Record JSON:</Label>
                        <Input appearance='underline' disabled={true} value={JSON.stringify(asak_record)} contentAfter={
                            <Button appearance='subtle' icon={<CopyRegular />} onClick={()=>{
                                navigator.clipboard.writeText(JSON.stringify(asak_record, null, 4));
                            }} />
                        }></Input>
                    </div>
                    <div className='config-line'>
                        <Label>Mode:</Label>
                        <Dropdown defaultValue='index' onActiveOptionChange={(e,data)=>{
                            set_asak_mode(data.nextOption.value);
                        }}>
                            <Option>index</Option>
                            <Option>available</Option>
                            <Option>random</Option>
                        </Dropdown>
                    </div>
                </div>
                <Toaster toasterId={toastId} />

                {/* ask */}
                <Divider />
                <div className='ask'>
                    <Input appearance='outline' placeholder='Send message to AI' style={{width: '100%'}} onChange={(e, data)=>{set_send2ai(data.value);}}></Input>
                    <Button appearance='primary' disabled={generating || send2ai === ''} onClick={()=>{
                        request_ai(send2ai);
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
};

export default App;