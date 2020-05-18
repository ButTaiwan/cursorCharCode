require 'json'

codes = {}
ranges = {}

f = File.open('./UnicodeData.txt', 'r')
f.each { |s|
	s.chomp!
	tmp = s.split(';')
	u = tmp[0]
	n = tmp[1]

	# F900;CJK COMPATIBILITY IDEOGRAPH-F900;Lo;0;L;8C48;;;;N;;;;;
	if n =~ /CJK COMPATIBILITY/
		n.gsub!(/-([0-9A-F]+)/, ' (' + tmp[5] + ')')
	end

	n.gsub!(/\w+/, &:capitalize).gsub!(/Cjk/, 'CJK')

	if n[0] != '<'
		codes[u] = n #.capitalize
	elsif tmp[10] != nil && tmp[10] != ""
		codes[u] = tmp[10].gsub!(/\w+/, &:capitalize)
	elsif n =~ /<(.+), First>/
		r = $1 #.capitalize
		ranges[r] = [u, nil]
	elsif n =~ /<(.+), Last>/
		r = $1 #.capitalize
		ranges[r][1] = u
	end
}
f.close

f = File.open('./ucd.json', 'w:utf-8')
f.puts JSON.pretty_generate({'codes' => codes, 'ranges' => ranges})
#f.puts JSON.generate({'codes' => codes, 'ranges' => ranges}).
f.close

