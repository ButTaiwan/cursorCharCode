#encoding: utf-8
require 'json'

$map = {}

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

def read_glyphs(fn, key)
	puts "Reading #{fn}..."

	f = File.open("#{fn}", 'r')
	f.each { |s|
		if s =~ /<glyph unicode="([^"]+)"/
			u = $1.to_i(16)
			if s =~ /name="([^"]+)"/
				n = $1
				$map[u] = {} unless $map.has_key?(u)
				puts "duplicated! #{u.to_s(16)}" if $map[u].has_key?(key)
				$map[u][key] = n
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


read_glyphs('GlyphData.xml', 'nn')

puts "Dumping JSON..."
res = {}
cnt = Hash.new(0)
$map.sort_by{ |k, v| k }.each { |k, v|
	next if k < 32 || k == 127
	kn = sprintf('%04x', k).upcase
	res[kn] = v

	v.each { |cs, z| cnt[cs] += 1 }
}

f = File.open('./encodings.json', 'w:utf-8')
#f.puts JSON.pretty_generate(res)
#f.puts JSON.generate(res, { :array_nl => "\n" })
f.puts JSON.generate(res).gsub("},", "},\n")
f.close

p cnt
