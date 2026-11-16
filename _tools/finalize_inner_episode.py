"""Finalize the local delivery records after technical QC and actual frame review."""
from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT))
from schemas.artifacts import validate_artifact
ART=ROOT/'projects/tam-ly-noi-tam-tap01-v2/artifacts'
EP=ROOT/'Chu-De/Tam-Ly-Noi-Tam/episodes/01-mot-cau-noi-thoang-qua'
OUT=EP/'render';VIDEO=OUT/'01-mot-cau-noi-thoang-qua-haitrieu-1080p.mp4'
assert '--visual-reviewed' in sys.argv,'Inspect the extracted final frames first.'
qc=json.loads((ART/'technical-qc.json').read_text(encoding='utf-8'))
assert qc['full_decode_succeeded'] and not qc['black_intervals']
assert float(qc['loudness']['input_tp'])<0
assert qc['provider_transcript_matches_script_tokens']==1
assert not qc['silence_intervals'],'Review any detected silence before finalizing.'
limitations=['Word highlight timing is interpolated within Vibi SRT cues, not forced alignment.',
 'Source stock footage is HD 720p within the 1080p export.',
 'Audio was checked by waveform correlation, levels and gap detection; perceptual listening was not performed.']
relative=str(VIDEO.relative_to(ROOT))
review={'version':'1.0','output_path':relative,'status':'pass','checks':{
 'technical_probe':{'valid_container':True,'duration_seconds':qc['duration_seconds'],'resolution':qc['resolution'],'fps':qc['fps'],'has_audio':True,'codec':qc['video_codec'],'file_size_bytes':qc['file_size_bytes'],'issues':[]},
 'visual_spotcheck':{'frames_sampled':len(qc['frames_for_visual_review']),'frame_paths':[f['path'] for f in qc['frames_for_visual_review']],'black_frames_detected':False,'broken_overlays':False,'missing_assets':False,'unreadable_text':False,'issues':[]},
 'audio_spotcheck':{'narration_present':True,'music_present':True,'unexpected_silence':False,'clipping_detected':False,'issues':[limitations[-1]]},
 'promise_preservation':{'delivery_promise_honored':True,'renderer_family_used':'explainer-teacher','render_runtime_used':'remotion','runtime_swap_detected':False,'runtime_swap_check':'Remotion composition rendered every frame and the complete audio mix. FFmpeg joined encoded chunks and muxed audio only.','silent_downgrade_detected':False,'issues':[]},
 'subtitle_check':{'subtitles_expected':True,'subtitles_present':True,'coverage_ratio':1,'issues':[limitations[0]]},
 'transcript_comparison':{'transcript_matches_script':None,'word_accuracy':None,'issues':['Provider-exported SRT matches the script tokens exactly. No independent ASR transcription of the exported audio was performed.']}},
 'issues_found':limitations,'recommended_action':'present_to_user','metadata':{'technical_qc':'technical-qc.json','voice':'Haitrieu','speed':1.0,'script_revision':2,'visual_review_scope':'Representative final encoded frames, plus full automated decode and black-frame scan; not a full perceptual viewing.'}}
report={'version':'1.0','outputs':[{'path':relative,'format':'mp4','resolution':qc['resolution'],'duration_seconds':qc['duration_seconds'],'codec':qc['video_codec'],'audio_codec':qc['audio_codec'],'fps':30,'file_size_bytes':qc['file_size_bytes'],'platform_target':'youtube'}],
 'warnings':limitations,'verification_notes':['Full video/audio decode completed without errors.','No black intervals >=0.45s or silence >=2s detected.','Narration waveform matches at the beginning, middle and end; see technical-qc.json.','Representative final frames were visually inspected.'],
 'render_grammar':'explainer-teacher','decision_log_ref':'../decision_log.json','final_review_ref':'final-review.json','metadata':{'composition':'InnerThoughtsEpisode','render_runtime':'remotion','resumed_render':True,'standalone_player':str((OUT/'XEM_VIDEO.html').relative_to(ROOT))}}
for name,data in [('final_review',review),('render_report',report)]:
 validate_artifact(name,data);(ART/(name.replace('_','-')+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
qc['visual_review_pending']=False;(ART/'technical-qc.json').write_text(json.dumps(qc,ensure_ascii=False,indent=2),encoding='utf-8')
status={'status':'complete','scope':'User-requested local episode video with Haitrieu','output':relative,'review':'artifacts/final-review.json','external_publication':False}
(ART.parent/'production-status.json').write_text(json.dumps(status,ensure_ascii=False,indent=2),encoding='utf-8')
meta=json.loads((EP/'script-metadata.json').read_text(encoding='utf-8'));meta['production'].update(status='complete',verified_duration_seconds=qc['duration_seconds'],final_review=str((ART/'final-review.json').relative_to(ROOT)))
(EP/'script-metadata.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
readme=(OUT/'README.md').read_text(encoding='utf-8').replace('Video khi xuất xong:','Video đã xuất và kiểm tra:')
readme+='\nĐã kiểm tra toàn bộ luồng video/âm thanh bằng FFmpeg, lấy mẫu khung hình sau mã hóa và đối chiếu sóng lời đọc ở đầu, giữa, cuối. Xem `technical-qc.json` và `final-review.json` trong thư mục artifacts của dự án.\n'
(OUT/'README.md').write_text(readme,encoding='utf-8')
print('Final review and render report validated. Local episode delivery complete.')
