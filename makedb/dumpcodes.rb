#encoding: utf-8
require 'json'

$codes = {}
$ranges = []

$map = {}

def set_skey unidec, s, mode = nil
	unidec = unidec.to_i(16) if unidec.class == String

	return if mode == 'char' && (s.length > 4 || s < '4E00' || s > '9FFC')
	s = s.to_i(16).chr('utf-8') if mode == 'char'

	$map[unidec] = {} if !$map.has_key?(unidec)
	$map[unidec]['sk'] = [] if !$map[unidec].has_key?('sk')
	$map[unidec]['sk'] << s
end

def read_ucd
	puts "Loading UCD..."
	groups = []
	g = nil
	r = nil

	f = File.open('./UnicodeData-14.0.0d1.txt', 'r')
	f.each { |s|
		s.chomp!
		tmp = s.split(';')
		u = tmp[0]
		n = tmp[1]

		n.gsub!(/\w+/, &:capitalize).gsub!(/Cjk/, 'CJK')

		if n =~ /^CJK Compatibility Ideograph-([0-9A-Fa-f]{4,5})$/
			set_skey(u, tmp[5], 'char') if tmp[5] != ''
		elsif n =~ / Ideograph-([0-9A-Fa-f]{4})$/
			code = $1.upcase
			code = '' if code.upcase == u					
			set_skey(u, code, 'char') if code != ''
		elsif tmp[5] != '' #n =~ /Kangxi Radical/
			code = tmp[5].gsub(/[^0-9A-F]/, '')
			set_skey(u, code, 'char') if code.length == 4 && code >= '4E00' && code <= '9FFC'
		end

		set_skey(u, '...') if n =~ /Ellipsis/

		if g != nil
			#p g[:name].length
			if n[0 ... g['name'].length] == g['name']
				g['start'] = u if u < g['start']
				g['end'] = u if u > g['end']
				g['tmp'] << [u, n] if g['tmp'].size < 5

				postfix = n[g['name'].length..-1].gsub(/^[ -]?[A-Za-z0-9]+($| |-Vas)/, '')
				$codes[u] = n if n =~ /[A-Za-z]$/ if postfix != ''
				next
			else
				g = nil
			end
		end

		#n.gsub!(/-([0-9A-Fa-f]+)$/, tmp[5] != '' ? (" #{tmp[5]}(" + tmp[5].to_i(16).chr('utf-8') + ')') : '') if n =~ /^CJK Compatibility/
		#n.gsub!(/ Ideograph-([0-9A-Fa-f]{4,5})$/) { |m| ' Ideograph ' + $1.upcase + '(' + $1.to_i(16).chr('utf-8') + ')' }

		if g == nil
			if n =~ /^(.+Ideograph)-[0-9A-Fa-f]{4,5}$/
				gn = $1
				g = {'name' => gn, 'start' => u, 'end' => u, 'tmp' => [[u, n]]}
				groups << g
				next
			elsif n =~ /^(?:Anatolian|Egyptian|Siddham|Linear [AB])/ && n =~ /([^-]+) [A-Z][a-z]?\d+[a-z]?$/i
				g = {'name' => $1.chomp, 'start' => u, 'end' => u, 'tmp' => [[u, n]]}
				groups << g
				next
			elsif n =~ /^([^-]+ Character)-([0-9A-Fa-f]{4,5})$/
				g = {'name' => $1.chomp, 'start' => u, 'end' => u, 'tmp' => [[u, n]]}
				groups << g
				next
			elsif n =~ /^([^-]+)(-\d+)+$/
				g = {'name' => $1.chomp, 'start' => u, 'end' => u, 'tmp' => [[u, n]]}
				groups << g
				next
			end
		end

		if n[0] != '<'
			$codes[u] = n #.capitalize
		elsif tmp[10] != nil && tmp[10] != ""
			$codes[u] = tmp[10].gsub!(/\w+/, &:capitalize)
		elsif n =~ /<(.+), First>/
			rn = $1 #.capitalize
			r = {'name' => rn, 'start' => u, 'end' => nil, 'tmp' => nil}
			groups << r
		elsif n =~ /<(.+), Last>/
			rn = $1 #.capitalize
			r['end'] = u if r['name'] == rn
		end
	}
	f.close

	groups.each { |g|
		if g['tmp'] != nil && g['tmp'].size <= 3
			g['tmp'].each { |t|
				$codes[t[0]] = t[1]
				#p t[0]
			}
		else
			$ranges << {'name' => g['name'], 'start' => g['start'], 'end' => g['end'] }
		end
	}

	#p groups
	$codes = $codes.sort_by { |k, v| k.to_i(16) }.to_h
end


def set_cmap(unidec, cid, key)
	return if unidec < 32
	$map[unidec] = {} unless $map.has_key?(unidec)
	return if key == 'ajn' && $map[unidec]['aj'] == cid
	$map[unidec][key] = cid
end

def read_cmap(ros, fn, key)
	#res = {}
	puts "Reading #{fn}..."
	f = File.open("cmap-resources-master/#{ros}/CMap/#{fn}", 'r')
	f.each { |s|
		if s =~ /^<([0-9a-f]{8})>\s+<([0-9a-f]{8})>\s+(\d+)/
			a = $1.to_i(16)
			b = $2.to_i(16)
			c = $3.to_i
			(b-a+1).times { |i|
				set_cmap(a+i, c+i, key)
			}
		elsif s =~ /^<([0-9a-f]{8})>\s+(\d+)/
			a = $1.to_i(16)
			c = $2.to_i
			set_cmap(a, c, key)
		end
	}
	f.close
	#res
end

def read_vs(fn, key)
	puts "Reading #{fn}..."
	f = File.open("cmap-resources-master/#{fn}.txt", 'r')
	f.each { |s|
		s.chomp!
		if s =~ /([0-9A-F]+) ([0-9A-F]+);[^;]+; CID\+(\d+)/
			u = $1.to_i(16)
			vs = $2
			c = $3.to_i

			$map[u] = {} if !$map.has_key?(u)
			next if $map[u].has_key?(key) && $map[u][key] == c
			
			#puts "vs already exists #{u} #{vs} #{$map[u][vs]} #{c}" if $map[u].has_key?('vs')
			#$map[u][vs] = c

			k = key + (vs.length == 4 ? 'S' : 'I') + vs[-1]
			$map[u][k] = c
		end
	}
	f.close
	
	#3402 E0100; Adobe-Japan1; CID+13698
end

def set_codepage(unidec, ansi, key)
	return if unidec == ansi
	$map[unidec] = {} unless $map.has_key?(unidec)
	return if (key == 'ua' || key == 'hk' || key == 'mb') && $map[unidec]['b5'] == sprintf('%04x', ansi).upcase
	return if (key == 'mj') && $map[unidec]['sj'] == sprintf('%04x', ansi).upcase
	$map[unidec][key] = sprintf('%04x', ansi).upcase
end

def read_codepage(fn, key, fn2 = nil)
	puts "Reading #{fn}..."

	map2 = {}
	if fn2
		f = File.open("codepages/#{fn2}.TXT", 'r')
		f.each { |s|
			if s =~ /^0x([0-9A-F]+)\s+0x([0-9A-F]+)\s/
				a = $1.to_i(16)
				u = $2.to_i(16)
				map2[u] = a
			end
		}
		f.close
	end

	f = File.open("codepages/#{fn}.TXT", 'r')
	f.each { |s|
		if s =~ /^0x([0-9A-F]+)\s+0x([0-9A-F]+)\s/
			a = $1.to_i(16)
			u = $2.to_i(16)
			next if !map2.empty? && map2[u] != a
			set_codepage(u, a, key)
		end
	}
	f.close
end

def read_codepage_hk(fn, key)
	puts "Reading #{fn}..."

	f = File.open("codepages/#{fn}.TXT", 'r')
	f.each { |s|
		if s =~ /^([0-9A-F]+)\s+([0-9A-F]+)\s+([0-9A-F]+)\s+([0-9A-F]+)/
			a = $1.to_i(16)
			u = $4.to_i(16)
			set_codepage(u, a, key)
		end
	}
	f.close
end

def read_glyphs(fn, key_same, key_skey)
	puts "Reading #{fn}..."

	f = File.open("#{fn}", 'r')
	f.each { |s|
		if s =~ /<glyph unicode="([^"]+)"/
			u = $1.to_i(16)
			if s =~ /name="([^"]+)"/
				n = $1
				$map[u] = {} unless $map.has_key?(u)
				puts "duplicated! #{u.to_s(16)}" if $map[u].has_key?(key_same) || $map[u].has_key?(key_skey)
				k = key_skey
				uh = sprintf('%04x', u).upcase
				un = $codes.has_key?(uh) ? $codes[uh].gsub(/[ -]/, '').downcase : ''
				#un = un.gsub(/With/, '') if un !~ /Letter/
				k = key_same if un.index(n.downcase) != nil
				k = key_same if n.downcase == un.gsub(/with/, '')
				k = key_same if n =~ /^[a-zA-Z]{25,}\d{0,2}(-[a-zA-Z]+\d{0,2})?$/
				$map[u][k] = n
			end
		end
	}
	f.close
end

read_codepage('CP950', 'b5')
read_codepage('CHINTRAD', 'mb')
read_codepage_hk('hkscs-2008-big5-iso', 'hk')
read_codepage('uao250-b2u', 'ua', 'uao250-u2b')
read_codepage('CP932', 'sj')
read_codepage('JAPANESE', 'mj')
read_codepage('CP936', 'gb')
read_codepage('CP949', 'ks')

read_cmap('Adobe-CNS1-7', 'UniCNS-UTF32-H', 'ac')
read_cmap('Adobe-Japan1-7', 'UniJIS-UTF32-H', 'aj')
read_cmap('Adobe-Japan1-7', 'UniJIS2004-UTF32-H', 'ajn')
read_cmap('Adobe-GB1-5', 'UniGB-UTF32-H', 'ag')
read_cmap('Adobe-Korea1-2', 'UniKS-UTF32-H', 'aks')
read_cmap('Adobe-KR-9', 'UniAKR-UTF32-H', 'ak')

read_vs('Adobe-Japan1_sequences', 'aj')
read_vs('Adobe-CNS1_sequences', 'ac')
read_vs('Adobe-GB1_sequences', 'ag')
read_vs('Adobe-Korea1_sequences', 'aks')
read_vs('Adobe-KR_sequences', 'ak')

read_ucd()

read_glyphs('GlyphData.xml', 'nn', 'nk')


puts "Dumping UCD..."
f = File.open('./ucd.json', 'w:utf-8')
f.puts '{"codes":'
f.puts JSON.generate($codes).gsub(/,/, ",\n")
f.puts ', "ranges":'
f.puts JSON.generate($ranges).gsub(/\},/, "},\n")
f.puts '}'
f.close

puts "Dumping JSON..."
res = {}
cnt = Hash.new(0)
$map.sort_by{ |k, v| k }.each { |k, v|
	next if k < 32 || k == 127
	kn = sprintf('%04x', k).upcase
	v['sk'] = v['sk'].join(' ') if v.has_key?('sk')
	res[kn] = v

	v.each { |cs, z| cnt[cs] += 1 }
}

f = File.open('./encodings.json', 'w:utf-8')
#f.puts JSON.pretty_generate(res)
#f.puts JSON.generate(res, { :array_nl => "\n" })
f.puts JSON.generate(res).gsub("},", "},\n")
f.close

p cnt
