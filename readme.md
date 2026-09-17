cleared to '0'?" "In the Lockdown command's Command Dword 10 (Figure 291), what four fields are defined, and what does the Prohibit (PRHBT) bit do when set to '1' versus

What admin command opcode is assigned to the Lockdown command, and what command-specific status value can section 5.19.1 return, with what meaning?"

" "Section 5.19 states that a Lockdown command with the Interface field set to 01b or 10b is aborted if the NVM subsystem has no Management Endpoint. Which status code is returned, and where is its meaning formally defined?"

"A host wants to know, before issuing any Lockdown command, which admin opcodes and Set Features Feature Identifiers can actually be prohibited on a given controller. Which log page should it retrieve, what Log Identifier value selects it, and which Command Dword 10 sub-field lets it choose between 'supported to be prohibited' and 'currently prohibited'?"

"Under what exact condition does Command Dword 14 of a Lockdown command carry a meaningful UUID Index, and which figure defines the generic UUID Index field layout that CDW14 points to?"

"A controller reports OACS bit 10 set to '1' (Command and Feature Lockdown capability supported). Does this mean a Discovery controller in the same NVM subsystem may accept a Lockdown command?"

"Trace the complete chain a host must follow to discover that a controller supports vendor-specific, UUID-qualified Lockdown prohibition of a Set Features Feature Identifier, and then successfully issue that Lockdown command."

"A Discovery controller's Admin Command Support table marks Lockdown as Prohibited, yet the NVM subsystem's Identify Controller data structure has OACS bit 10 set to '1'. Is this a spec violation? If a host mistakenly issues Lockdown on that Discovery controller anyway, what status code architecture (type and code) governs the resulting error, and where is each part formally defined?"

Which Command Dword 10 field in the Firmware Commit command specifies the firmware slot to activate?"

" "Which Set Features Feature Identifier number corresponds to 'Keep Alive Timer', and is it a legal target for a Lockdown command with Scope set to 2h?"

" What do the two defined values of the Select (SEL) field in Namespace Management's Command Dword 10 mean, and how does the meaning of the Namespace Identifier (NSID) field change between them?"

"Per section 5.23, if a controller supports the Namespace Management command, what other Admin command must it also support, and why?"

"What does Command Dword e of the completion queue entry contain after a successful Namespace Management Create operation, and where is the general rule that CQE Dword 0/1 are 'command specific fields established?" "A host issues a Namespace Management Create command specifying both a non-zero NVM Set Identifier and a non-zero Endurance Group Identifier. Under what

condition does the controller honor the request, and under what condition must it abort with which status code?" "Name three command-specific status codes unique to the Namespace Management command, and identify which data structure a host should check beforehand to avoid triggering 'Namespace Insufficient Capacity'."

"Which OACS bit indicates Namespace Management capability support, and what two additional behaviors does section 8.11 require or recommend the controller provide when this capability is supported?" "A host wants to create a namespace pinned to a specific NVM Set within a specific Endurance Group, using the NVM Command Set, while ensuring any other

controller already attached to a sibling namespace is notified of the change. Trace every section involved from checking controller capability through to the notification path, and state the status code returned if the NVM Set/Endurance Group pairing given is invalid."

"For an NVM subsystem containing I/O, Administrative, and Discovery controllers, determine controller-type by controller-type whether each may accept a Namespace Management command, and explain how OACS bit 3 interacts with that per-controller-type picture." "What CDW10 field value selects 'Attach' versus 'Detach' in the Namespace Management command?"

"Which status code does the Format NVM command return when a namespace's format operation is already in progress?"

)

