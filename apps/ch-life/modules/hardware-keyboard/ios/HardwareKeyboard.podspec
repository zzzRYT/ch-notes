Pod::Spec.new do |s|
  s.name             = 'HardwareKeyboard'
  s.version          = '1.0.0'
  s.summary          = 'Reports whether a physical keyboard is connected.'
  s.description      = s.summary
  s.author           = 'ch-life'
  s.homepage         = 'https://github.com/zzzRYT/ch-notes'
  s.platforms        = { :ios => '15.1' }
  s.swift_version    = '5.9'
  s.source           = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
