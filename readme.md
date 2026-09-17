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



"Given: OACS bit 10 = '1'; the controller is an Administrative controller (Lockdown is Optional and implemented per its Admin Command Support table); the Command and Feature Lockdown log page (Scope=0h) lists admin opcode 11h (Firmware Image Download) as supported-to-be-prohibited but NOT currently prohibited on any interface. A host then issues a Lockdown command with SCP=0h, OFI=11h, PRHBT=1, IFC=00b (Admin Submission Queue only). State, in one line only, the exact completion status this command receives."

"Given: vendor-specific Set Features Feature Identifier F5h is defined by UUID List index 3, the Commands Supported and Effects data structure marks UUID Selection Supported for both Lockdown and Set Features; the Command and Feature Lockdown log page, queried with Scope 2h and UUID Index=3, lists F5h as supported-to-be-prohibited but not currently prohibited on either interface; the controller is an I/O controller (Lockdown Optional, implemented) with OACS bit 10='1'; the NVM subsystem DOES contain a Management Endpoint. A host issues Lockdown with SCP=2h, OFI=F5h, CDW14 UUID Index=3, PRHBT=1, IFC-01b (Admin SQ and out-of-band Management Endpoint). State, in one line only, the exact completion status of this command."

"Given: OACS bit 3 = '1'; the controller is an Administrative controller (Namespace Management is Optional and implemented per its Admin Command Support table); the target NVM Set exists within the target Endurance Group; sufficient unallocated NVM capacity is confirmed via the Identify Namespace data structure; CSI=0h (NVM Command Set) is requested; NSID is correctly cleared to Oh for the Create operation. State, in one line only, the exact outcome reported in the completion queue entry.

"Given: OACS bit 3 = '1' on an Administrative controller (Namespace Management Optional, implemented, per its Admin Command Support table and capability description); a Create operation specifies CSI=0h, a valid NVM Set within a valid Endurance Group, sufficient unallocated capacity confirmed via Identify Namespace, and the ANA Group Identifier field left cleared to 0h; a different controller in the same NVM subsystem is already attached to a sibling namespace in that Endurance Group with Namespace Attribute Notices enabled; this subsystem's Discovery controller separately marks Namespace Management as Prohibited in its own Admin Command Support table. State, in one line only, the exact completion status the Create operation itself receives on the Administrative controller."

)

3

)

